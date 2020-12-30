import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import * as fastify from 'fastify';
import { APP_CONSTANTS } from '../../../shared/utils/app.constants';
import { AppConfigService } from '../../../shared/services/app-config/app-config.service';

@Injectable()
export class FileReqInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    // get the req
    const req: fastify.FastifyRequest = context.switchToHttp().getRequest<fastify.FastifyRequest>();

    // validate the content-type
    const headerVal = req.headers['content-type'].split(APP_CONSTANTS.CHAR.SEMI_COLON)[0];
    // if its not a multipart/form-data then throw custom error
    if (!FileReqInterceptor.validateContentType(headerVal)) {
      // throw error
      throw AppConfigService.getCustomError('VALIDATION', `Request is not of a proper content type. ${headerVal} is not a valid one`);
    }

    return next.handle();
  }

  private static validateContentType(contentTypeVal: string): boolean {
    return APP_CONSTANTS.REGEX.MULTIPART_CONTENT_TYPE.test(contentTypeVal);
  }
}
