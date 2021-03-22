import { Controller, Get } from '@nestjs/common';

@Controller('aws-terminus')
export class TerminusController {
  constructor() {}

  @Get('health-check')
  public async checkHealth() {
    return { status: 'Green', message: 'OK' };
  }
}
