import { Injectable } from '@nestjs/common';

@Injectable()
export class CloudAwsService {
  getHello(): string {
    return 'Hello World!';
  }
}
