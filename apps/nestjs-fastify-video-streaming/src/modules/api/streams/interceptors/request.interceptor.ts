import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import * as fastify from 'fastify';
import { APP_CONSTANTS } from '../../../shared/utils/app.constants';
import { AppConfigService } from '../../../shared/services/app-config/app-config.service';
@Injectable()
export class RequestInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest() as fastify.FastifyRequest;
    const headerVal = (req as fastify.FastifyRequest).headers['content-type'].split(APP_CONSTANTS.CHAR.SEMI_COLON)[0];
    if (APP_CONSTANTS.REGEX.MULTIPART_CONTENT_TYPE.test(headerVal)) {
      return next.handle();
    } else {
      throwError(AppConfigService.getCustomError('FID-Header', 'Request is not of multipart/ content type'));
    }
  }
}
