import { HttpModule, Module } from '@nestjs/common';
import { AppConfigService } from './services/app-config/app-config.service';
import { AppUtilService } from './services/app-util/app-util.service';
import { RetryService } from './services/retry/retry.service';
import { HttpCommonInterceptor } from './interceptors/http-common.interceptor';
import { HttpConfigService } from './services/http-config/http-config.service';
import { CorsInterceptor } from './interceptors/cors.interceptor';
import { ConfigModule } from '@nestjs/config';
@Module({
  imports: [
    HttpModule.registerAsync({
      useClass: HttpConfigService,
    }),
    ConfigModule,
  ],
  exports: [HttpConfigService, RetryService, HttpCommonInterceptor, CorsInterceptor],
  providers: [AppConfigService, AppUtilService, RetryService, HttpCommonInterceptor, HttpConfigService, CorsInterceptor],
})
export class SharedModule {}
