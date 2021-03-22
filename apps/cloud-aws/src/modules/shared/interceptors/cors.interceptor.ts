import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import * as fastify from 'fastify';
import { API_AWS_CONST } from '../../core/util/api-aws.constants';
import { AppConfigService } from '../../../../../nestjs-fastify-video-streaming/src/modules/shared/services/app-config/app-config.service';
import { switchMap } from 'rxjs/operators';
import { APP_CONSTANTS } from '../../../../../nestjs-fastify-video-streaming/src/modules/shared/utils/app.constants';

@Injectable()
export class CorsInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    // get the request
    const request: fastify.FastifyRequest = context.switchToHttp().getRequest();
    const response: fastify.FastifyReply = context.switchToHttp().getResponse();
    // verify for the origin/referrer in the request header
    const hostHeader = request.headers['host'];
    const originHeader = request.headers['origin'] && true ? <string>request.headers['origin'] : null;
    console.log('origin header', originHeader);
    let allowedOrigin: boolean = false;
    if (hostHeader) {
      allowedOrigin = API_AWS_CONST.CORS.WHITELIST.indexOf(hostHeader) != -1;
    } else {
      allowedOrigin = API_AWS_CONST.CORS.WHITELIST.indexOf(originHeader) != -1;
    }

    if (allowedOrigin) {
      // now you have to set the CORS headers in the response
      let headerObjMap = new Map();
      API_AWS_CONST.CORS.HEADERS.map(item => {
        item = item.toLowerCase();
        if (item.includes('Origin'.toLowerCase())) {
          headerObjMap.set(item, request.headers['host'] ? request.headers['host'] : request.headers['origin']);
        } else if (item.includes('Credentials'.toLowerCase())) {
          headerObjMap.set(item, APP_CONSTANTS.CORS.ALLOW_CRED);
        } else if (item.includes('Method'.toLowerCase())) {
          headerObjMap.set(item, [...APP_CONSTANTS.CORS.ALLOW_METHODS].join(','));
        } else if (item.includes('Headers'.toLowerCase())) {
          headerObjMap.set(item, [...APP_CONSTANTS.CORS.ALLOW_HEADERS].join(','));
        }
      });
      response.headers(Object.entries(headerObjMap));
    } else {
      // throw cors error
      // IMP!!!: Reason for throwing the error wiht switchMap is because the error is a manual one
      // and cannot be caught , so the request stream which is an obsservable , needs to be switched to another obs
      // and this time, the obs should be an error obs
      return next.handle().pipe(
        switchMap(() => {
          return throwError(
            AppConfigService.getCustomError('CORS', `The referrer/host  - ${hostHeader}/${originHeader} of the request is not whitelisted`),
          );
        }),
      );
    }
  }
}
