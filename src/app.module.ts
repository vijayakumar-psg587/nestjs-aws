import { Module } from '@nestjs/common';
import { CoreModule } from './modules/core/core.module';
import { SharedModule } from './modules/shared/shared.module';
import { ApiModule } from './modules/api/api.module';
import { TerminusModule } from './modules/terminus/terminus.module';

@Module({
  imports: [CoreModule, SharedModule, ApiModule, TerminusModule],
})
export class AppModule {}
