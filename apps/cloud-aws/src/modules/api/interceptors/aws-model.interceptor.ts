import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import * as fastify from 'fastify';
import {AWSUtilService} from "../utils/aws-util/aws-util.service";
@Injectable()
export class AwsModelInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest() as fastify.FastifyRequest;
    //make sure to set awsServiceConfigModel if empty or undefined
    AWSUtilService.getAWSServiceConfig();
    // then continue with the request
    return next.handle();
  }
}
