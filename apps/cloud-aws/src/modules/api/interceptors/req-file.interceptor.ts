import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import {FastifyRequest} from "fastify";
import {API_AWS_CONST} from "../../core/util/api-aws.constants";
import {AppUtilService} from "../../shared/services/app-util/app-util.service";
import {ErrorTypes} from "../../shared/models/enums/error/error-types.enum";

@Injectable()
export class ReqFileInterceptor implements NestInterceptor {
  intercept( context: ExecutionContext, next: CallHandler ): Observable<any> {
   
    const req = context.switchToHttp().getRequest() as FastifyRequest;
    console.log('coming in req file interceptor', req.headers['content-type']);
    if(!API_AWS_CONST.REGEX.MULTIPART_CONTENT_TYPE.test(req.headers["content-type"].split(API_AWS_CONST.CHAR.SEMI_COLON)[0]) ) {
      // then throw err
      throw AppUtilService.handleCustomException(400, ErrorTypes.VALIDATION, `Request content should be a multipart content`);
    }
    return next.handle();
  }
}
