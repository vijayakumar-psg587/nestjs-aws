import { Module } from '@nestjs/common';
import { CloudModule } from './cloud/cloud.module';

@Module({
  imports: [CloudModule],
})
export class CoreModule {}
