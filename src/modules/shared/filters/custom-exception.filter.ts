import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';
import * as fastify from 'fastify';

@Catch()
export class CustomExceptionFilter<T> implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost): any {
    console.log('getting exception inside custom filter', exception);
    const res: fastify.FastifyReply = host.switchToHttp().getResponse() as fastify.FastifyReply;

    // send the response here
    res.send({ error: exception });
  }
}
