import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { IncomingMessage, Server, ServerResponse } from 'http';
import { v4 as uuidv4 } from 'uuid';
import * as multer from 'fastify-multer';
import * as path from 'path';
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

  static async configureMulter(app: NestFastifyApplication): Promise<void> {
    await app.register(
            multer({
              dest: path.join(process.cwd() + '/upload'),
              limits: {
                fields: 5, //Number of non-file fields allowed
                files: 1,
              },
            }).contentParser,
    );
  }
}
