import { Module } from '@nestjs/common';
import { CloudModule } from './cloud/cloud.module';
import { CoreController } from './controllers/core/core.controller';

@Module({
  imports: [CloudModule],
  controllers: [CoreController],
})
export class CoreModule {}
