import { Module } from '@nestjs/common';
import { HttpConfigService } from './services/http-config/http-config.service';

@Module({
  providers: [HttpConfigService]
})
export class CoreModule {}
