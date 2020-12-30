import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { IncomingMessage, Server, ServerResponse } from 'http';
import * as uuid from 'uuid';
import { APP_CONSTANTS } from './modules/shared/utils/app.constants';
import { AppConfigService } from './modules/shared/services/app-config/app-config.service';
import * as fastifyHelmet from 'fastify-helmet';
import * as multer from 'fastify-multer';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as path from 'path';
import { HttpAdapterHost } from '@nestjs/core';

export class ServerAdapter {
  static fastifyAdapter: FastifyAdapter;

  constructor() {
    ServerAdapter.fastifyAdapter = new FastifyAdapter<Server, IncomingMessage, ServerResponse>();
  }

  static getFastifyAdapter(): FastifyAdapter {
    const appConfig = AppConfigService.getAppCommonConfig();
    ServerAdapter.fastifyAdapter = new FastifyAdapter<Server, IncomingMessage, ServerResponse>({
      trustProxy: true,
      genReqId: () => uuid.v4().toString(),
      ignoreTrailingSlash: false,
      caseSensitive: false,
      requestIdLogLabel: appConfig.name,
      version: APP_CONSTANTS.COMMON.VERSION,
    });
    return this.fastifyAdapter;
  }

  static generateSwagger(app: NestFastifyApplication) {
    const swaggerModel = AppConfigService.getSwaggerModel();
    if (swaggerModel) {
      const options = new DocumentBuilder()
        .setTermsOfService('tos')
        .setContact('Vijay', '', 'vijay.psg587@gmail.com')
        .addTag('Stream', 'Api for streaming')
        .addTag('Terminus', 'Health check service')
        .addTag('AWS-S3-Crud', 'Api to deal with AWS S3 crud operations')
        .setTitle(swaggerModel.title)
        .setVersion(swaggerModel.version)
        .setBasePath(swaggerModel.context_path)
        .build();
      const doc = SwaggerModule.createDocument(app, options);
      SwaggerModule.setup(swaggerModel.context_path + '/swagger-ui', app, doc, { swaggerUrl: 'swagger-ui' });
    }
  }

  static configureSecurity(app) {
    app.register(fastifyHelmet, {
      hsts: {
        strictTransportSecurity: {
          maxAge: 123456,
          includeSubDomains: true,
        },
      },
      dnsPrefetchControl: {
        allow: false,
      },
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'", "'unsafe-inline'", 'data:'],
          scriptSrc: ["'self'", "'unsafe-inline'"],
          objectSrc: ["'none'"],
          upgradeInsecureRequests: [],
        },
      },
    });
    // app.register(require('fastify-cookie'), {key: '_csrf'});
    // app.register(require('fastify-csrf'), { cookie: true, secure: true, ignoreMethods: ['GET', 'OPTIONS', 'HEAD']});
  }

  static configureMulter(app) {
    app.register(
      multer({
        dest: path.join(process.cwd() + '/upload'),
        limits: {
          fields: 5, //Number of non-file fields allowed
          files: 1,
          fileSize: 2097152, // 2 MB,
        },
      }).contentParser,
    );
  }

  // THis is a sample method of getting the fastifyInstance and working on it directly
  // a lot more can be done such as adding decorators, registering the fastify plugins directly as well
  // a simple usage is shown below
  static addHooks(app: NestFastifyApplication) {
    const adapterHs = app.get(HttpAdapterHost);
    const fastifyInstance = (adapterHs.httpAdapter as FastifyAdapter).getInstance();
    fastifyInstance.addHook('onResponse', (request, reply, done) => {
      console.log('before sending response:'); // DO something
      done();
    });
  }
}
