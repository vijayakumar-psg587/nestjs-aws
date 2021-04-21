import {NestFactory} from '@nestjs/core';
import {NestFastifyApplication} from '@nestjs/platform-fastify';
import {ServerAdapter} from './server-adapter';
import {AppConfigService} from '../../nestjs-fastify-video-streaming/src/modules/shared/services/app-config/app-config.service';
import * as path from 'path';
import compress from 'fastify-compress';
import {CloudAwsModule} from './cloud-aws.module';
import {CustomExceptionFilter} from './modules/shared/filters/custom-exception.filter';
import {CorsInterceptor} from './modules/shared/interceptors/cors.interceptor';
import {HttpCommonInterceptor} from './modules/shared/interceptors/http-common.interceptor';
import {HttpStatus, ValidationPipe} from "@nestjs/common";
import {AppUtilService} from "./modules/shared/services/app-util/app-util.service";

let app: NestFastifyApplication;
(async function bootstrap() {
  const fastifyAdapter = ServerAdapter.getFastifyAdapter();
  let pathOfConfig: string;
  // load using dot-env -  only for local - the above takes care of loading config values
  if (process.env.NODE_ENV === 'development') {
    if(process.env.NODE_DEBUG_ENABLED && process.env.NODE_DEBUG_ENABLED === 'true' ) {
      pathOfConfig = path.join(process.cwd(), '../config/development/.env')
    } else {
      pathOfConfig = path.join(process.cwd(), './apps/cloud-aws/config/development/.env');
    }
    console.log('pathConfig:', pathOfConfig);
    require('dotenv').config({ path: pathOfConfig });
  }

  try {
    const appConfig = AppConfigService.getAppCommonConfig();
    const fastifyAdapter = ServerAdapter.getFastifyAdapter();
    app = await NestFactory.create<NestFastifyApplication>(CloudAwsModule, fastifyAdapter);

    // Register compression
    await app.register(compress, { encodings: ['gzip', 'deflate'] });

    // configure security

    // configure filters and interceptors
    console.log('getting app config:', appConfig);
    app.setGlobalPrefix(appConfig.context_path);
    app.useGlobalPipes(
      new ValidationPipe({
        exceptionFactory: ((errors) => AppUtilService.customValidationExceptionFactory(errors))
      })
    )
    app.useGlobalFilters(new CustomExceptionFilter());
    app.useGlobalInterceptors(new CorsInterceptor(), new HttpCommonInterceptor());
    await ServerAdapter.configureMulter(app);
    // configure validation exception handlers

    await app.listen(appConfig.port, () => {
      console.log(`App is running in ${appConfig.port}`);
    });
  } catch (err) {
    process.stderr.write('Error in creating fastify -Stopping the server:', err.message);
    process.exit(1);
    process.on('unhandledRejection', event => {
      process.stderr.write('Closing the app because of unhandled rejection:' + event);
      process.exit(1);
    });
  }
  process.on('SIGTERM', async () => {
    process.stdout.write('Closing the app because Ctrl+C is pressed');
    // TODO: any gracefull shutdown needed ? like closing the database connection
    try {
      await app.close();
    } catch (err) {
      process.stderr.write('Cannot gracefully shutdown the app - hence closing abruptly:', err.message);
      process.exit(1);
    }

    process.exit(1);
  });

  process.on('unhandledRejection', event => {
    process.stderr.write('Closing the app because of unhandled rejection:' + event);
    process.exit(1);
  });
})();
