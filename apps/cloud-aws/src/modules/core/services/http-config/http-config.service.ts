import { HttpModuleOptions, HttpModuleOptionsFactory, Injectable, Scope } from '@nestjs/common';
import { AppUtilService } from '../../../shared/services/app-util/app-util.service';

@Injectable({
  scope: Scope.DEFAULT,
})
export class HttpConfigService implements HttpModuleOptionsFactory {
  createHttpOptions(): Promise<HttpModuleOptions> | HttpModuleOptions {
    return {
      headers: AppUtilService.setAxiosRequestHeaders,
      timeout: 2,
      maxRedirects: 10,
      withCredentials: true,
      timeoutErrorMessage: 'Service timed out. Please contact helpdesk',
    };
  }
}
