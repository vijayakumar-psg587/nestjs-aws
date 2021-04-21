import { Controller, Get } from '@nestjs/common';
import { CloudGcpService } from './cloud-gcp.service';

@Controller()
export class CloudGcpController {
  constructor(private readonly cloudGcpService: CloudGcpService) {}

  @Get()
  getHello(): string {
    return this.cloudGcpService.getHello();
  }
}
