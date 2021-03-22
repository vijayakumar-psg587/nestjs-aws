import { Module } from '@nestjs/common';
import { CloudAwsController } from './cloud-aws.controller';
import { CloudAwsService } from './cloud-aws.service';
import { TerminusModule } from './modules/terminus/terminus.module';
import { SharedModule } from './modules/shared/shared.module';
import { CoreModule } from './modules/core/core.module';
import { ApiModule } from './modules/api/api.module';

@Module({
  imports: [TerminusModule, SharedModule, CoreModule, ApiModule],
  controllers: [CloudAwsController],
  providers: [CloudAwsService],
})
export class CloudAwsModule {}
