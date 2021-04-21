import { Injectable } from '@nestjs/common';

@Injectable()
export class CloudGcpService {
  getHello(): string {
    return 'Hello World!';
  }
}
