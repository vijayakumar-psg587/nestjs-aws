import { Controller, Get, Render, Res } from '@nestjs/common';
import * as fastify from 'fastify';
import * as path from 'path';
@Controller('upload.html')
export class CoreController {
  @Get('')
  @Render('/layouts/index')
  public async staticEngineView(@Res() reply) {
    return { title: 'File Upload' };
  }
}
