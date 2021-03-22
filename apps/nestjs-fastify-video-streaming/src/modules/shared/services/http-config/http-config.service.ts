import { HttpModuleOptions, HttpModuleOptionsFactory, Injectable } from '@nestjs/common';
import { APP_CONSTANTS } from '../../utils/app.constants';

@Injectable()
export class HttpConfigService implements HttpModuleOptionsFactory {
  constructor() {}

  createHttpOptions(): Promise<HttpModuleOptions> | HttpModuleOptions {
    return {
      timeout: 1000,
      headers: { 'App-name-axios': APP_CONSTANTS.COMMON.APP_NAME },
      maxRedirects: 5,
    };
  }
}
