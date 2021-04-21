import { Controller, Get } from '@nestjs/common';
import {TerminusService} from "../../service/terminus/terminus.service";

@Controller('aws-terminus')
export class TerminusController {
  constructor(private readonly service: TerminusService) {}

  @Get('health-check')
  public async checkHealth() {
    return await this.service.isExternallyAccessible();
  }
}
