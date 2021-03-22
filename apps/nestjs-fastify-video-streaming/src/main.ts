import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestFastifyApplication } from '@nestjs/platform-fastify';
import { AppConfigService } from './modules/shared/services/app-config/app-config.service';
import compression from 'fastify-compress';
import { ServerAdapter } from './server-adapter';
import { SharedModule } from './modules/shared/shared.module';
import { HttpCommonInterceptor } from './modules/shared/interceptors/http-common.interceptor';
import { CustomExceptionFilter } from './modules/shared/filters/custom-exception.filter';
import { join } from 'path';
import { ValidationPipe } from '@nestjs/common';
import { ValidationError } from 'class-validator';
import * as path from 'path';
import { AppUtilService } from './modules/shared/services/app-util/app-util.service';
let app: NestFastifyApplication;
import handlebars from 'handlebars';
(async function bootstrap() {
  // at the very start load the env -  check for the environment and load it - set it in system env variables or in package.json
  let pathOfConfig = '';
  if (AppUtilService.checkForDev(process.env.NODE_ENV)) {
    pathOfConfig = path.join(process.cwd(), './apps/nestjs-fastify-video-streaming/src/config/development/.env');
    require('dotenv').config({ path: pathOfConfig });
  } else {
    // do not load from .env file - let configmap take care of it
  }

  const appConfig = AppConfigService.getAppCommonConfig();
  try {
    app = await NestFactory.create<NestFastifyApplication>(AppModule, ServerAdapter.getFastifyAdapter());

    // Register compression
    await app.register(compression, { encodings: ['gzip', 'deflate'] });

    app.setGlobalPrefix(appConfig.context_path);
    // create swagger module
    ServerAdapter.generateSwagger(app);
    // now register fastify helmet for sec reasons
    await ServerAdapter.configureSecurity(app).catch(err => {
      process.stderr.write('Error creating security:', err);
      process.exit(1);
    });
    // register multer for handling file uploads
    await ServerAdapter.configureMulter(app).catch(err => {
      process.stderr.write('Error creating multer for multiform req handling:', err);
      process.exit(1);
    });

    // add the validation pipe here
    app.useGlobalPipes(
      new ValidationPipe({
        errorHttpStatusCode: 500,
        transform: true,
        validationError: {
          target: true,
          value: true,
        },
        exceptionFactory: (errors: ValidationError[]) => {
          // send it to the global exception filter\
          AppConfigService.validationExceptionFactory(errors);
        },
      }),
    );

    app.useStaticAssets({
      root: join(process.cwd(), './apps/nestjs-fastify-video-streaming', 'public'),
      prefix: '/public/',
    });
    app.setViewEngine({
      engine: {
        handlebars: require('hbs'),
      },
      templates: join(process.cwd(), './apps/nestjs-fastify-video-streaming', 'views'),
      includeViewExtension: true,
      options: {
        partials: {
          header: '/partials/header.hbs',
          footer: '/partials/footer.hbs',
          fileUpload: '/partials/file-upload.hbs',
        },
      },
    });
    // add hooks and see if it works
    ServerAdapter.addHooks(app);
    // await ServerAdapter.registerCustomPlugin(app);
    app.useGlobalInterceptors(app.select(SharedModule).get(HttpCommonInterceptor));
    app.useGlobalFilters(new CustomExceptionFilter());
    await ServerAdapter.registerStaticSite(app);
    await app.listen(appConfig.port, appConfig.host, async (err, data) => {
      if (!err) {
        console.log(`App is running in port - ${appConfig.port} -`);
      } else {
        process.stderr.write('Error starting the server:' + err);
        // @ts-ignore
        throw AppConfigService.getCustomError('FID-CUSTOM', 'Error in starting the server:' + err.name + ' - ' + err.message);
      }
    });
  } catch (err) {
    process.stderr.write('Cannot create app server:' + err);
    process.exit(1);

    process.on('unhandledRejection', event => {
      process.stderr.write('Closing the app because of unhandled rejection:' + event);
      process.exit(1);
    });
  }
})();
// Code for graceful shutdown
process.on('SIGTERM', async () => {
  try {
    await app.close();
  } catch (err) {
    process.stdout.write(`Error closing the app  - ${err}`);
    process.exit(1);
  }
  process.stdout.write('App is closed because of a SIGTERM event');
  process.exit(1);
});

// TODO: use Promise.all syntax to wrap aroud the await calls (more than one) await that
// and catch the exception , instead of listening to this rejection event
process.on('unhandledRejection', function(errThrown) {
  // this is a stream
  process.stderr.write('unhandled err thrown:' + errThrown);
  process.exit(1);
});
export const App: NestFastifyApplication = app;
