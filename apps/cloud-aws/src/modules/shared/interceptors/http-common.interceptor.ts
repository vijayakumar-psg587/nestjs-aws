import { CallHandler, ExecutionContext, Injectable, NestInterceptor, Scope } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import * as fastify from 'fastify';
import { API_AWS_CONST } from '../../core/util/api-aws.constants';

@Injectable({
  scope: Scope.DEFAULT,
})
export class HttpCommonInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map(resp => {
        let res = context.switchToHttp().getResponse() as fastify.FastifyReply;
        res.header('aws-app-name', API_AWS_CONST.COMMON.APP_NAME);
        return resp;
      }),
    );
  }
}
