import { Module } from '@nestjs/common';
import { AppUtilService } from './services/app-util/app-util.service';
import { AppConfigService } from './services/app-config/app-config.service';

@Module({
  providers: [AppUtilService, AppConfigService]
})
export class SharedModule {}
