import { ExceptionFilter, ArgumentsHost, Catch } from '@nestjs/common';
import * as fastify from 'fastify';
import { API_AWS_CONST } from '../../core/util/api-aws.constants';

@Catch()
export class CustomExceptionFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    console.log('exception coming in:', exception);
    let res = host.switchToHttp().getResponse() as fastify.FastifyReply;
    res.headers({ APP_NAME: API_AWS_CONST.COMMON.APP_NAME }).send(exception);
  }
}
