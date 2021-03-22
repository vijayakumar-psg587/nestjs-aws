import { Module } from '@nestjs/common';
import { CloudGcpController } from './cloud-gcp.controller';
import { CloudGcpService } from './cloud-gcp.service';

@Module({
  imports: [],
  controllers: [CloudGcpController],
  providers: [CloudGcpService],
})
export class CloudGcpModule {}
