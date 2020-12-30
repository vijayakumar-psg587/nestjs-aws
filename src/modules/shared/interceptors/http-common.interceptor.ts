import { CallHandler, ExecutionContext, Injectable, NestInterceptor, Scope } from '@nestjs/common';
import { Observable } from 'rxjs';
import { APP_CONSTANTS } from '../utils/app.constants';
import { map } from 'rxjs/operators';
import * as fastify from 'fastify';

@Injectable({
  scope: Scope.DEFAULT,
})
export class HttpCommonInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map(resp => {
        let res = context.switchToHttp().getResponse() as fastify.FastifyReply;
        res.header('app-name', APP_CONSTANTS.COMMON.APP_NAME);
        return resp;
      }),
    );
  }
}
