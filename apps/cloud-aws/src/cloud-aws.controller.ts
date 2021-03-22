import { Controller, Get } from '@nestjs/common';
import { CloudAwsService } from './cloud-aws.service';

@Controller()
export class CloudAwsController {
  constructor(private readonly cloudAwsService: CloudAwsService) {}

  @Get()
  getHello(): string {
    return this.cloudAwsService.getHello();
  }
}
