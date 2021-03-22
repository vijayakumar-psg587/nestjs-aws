import * as fastify from 'fastify';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { IncomingMessage, Server, ServerResponse } from 'http';
import { v4 as uuidv4 } from 'uuid';
import { APP_CONSTANTS } from '../../nestjs-fastify-video-streaming/src/modules/shared/utils/app.constants';
import { AppConfigService } from './modules/shared/services/app-config/app-config.service';
export class ServerAdapter {
  static fastifyAdapter: FastifyAdapter;
  constructor() {
    ServerAdapter.fastifyAdapter = new FastifyAdapter<Server, IncomingMessage, ServerResponse>();
  }

  static getFastifyAdapter(): FastifyAdapter {
    const appConfig = AppConfigService.getAppConfig();
    ServerAdapter.fastifyAdapter = new FastifyAdapter({
      ignoreTrailingSlash: true,
      caseSensitive: true,
      requestIdHeader: 'request-uuid',
      genReqId: () => uuidv4().toString(),
      trustProxy: true,
      pluginTimeout: 100000,
      requestIdLogLabel: 'req-id-label',
      version: appConfig.appVersion,
    });
    return ServerAdapter.fastifyAdapter;
  }
}
