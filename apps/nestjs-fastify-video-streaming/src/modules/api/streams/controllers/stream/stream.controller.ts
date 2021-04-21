import { Body, Controller, ExecutionContext, Get, Inject, Param, Put, Res, UploadedFile, UseInterceptors } from '@nestjs/common';
import { HeaderInterceptor } from '../../interceptors/header.interceptor';
import { ApiConsumes, ApiHeaders, ApiTags } from '@nestjs/swagger';
import { FileReqInterceptor } from '../../interceptors/file-req.interceptor';
import { FileStreamService } from '../../services/file-stream/file-stream.service';
import { APP_CONSTANTS } from '../../../../shared/utils/app.constants';
import { PrincipalRoleType } from '../../../../shared/models/enums/headers/principal-role-type.enum';
import { UserIdType } from '../../../../shared/models/enums/headers/user-id-type.enum';
import { FileInterceptor } from '@webundsoehne/nest-fastify-file-upload';
import { FileUploadModel } from '../../models/file-upload.model';
import { FileUploadPipe } from '../../pipes/file-upload.pipe';
import { RequestInterceptor } from '../../interceptors/request.interceptor';
import { FilenameArrayPipe } from '../../pipes/filename-array.pipe';
import { FilenamePipe } from '../../pipes/filename.pipe';
import * as fastify from 'fastify';
import * as pump from 'pump';
import { Readable } from 'stream';
import * as util from 'util';
import * as fs from 'fs';
import { AppConfigService } from '../../../../shared/services/app-config/app-config.service';
import { FileUtilService } from '../../services/file-util/file-util.service';
import { FileValidationPipe } from '../../pipes/file-validation.pipe';
import { NestFastifyApplication } from '@nestjs/platform-fastify';

@Controller()
@ApiTags('Stream')
@UseInterceptors(HeaderInterceptor)
export class StreamController {
  constructor(
    private readonly fileStreamService: FileStreamService,
    // private readonly context: ExecutionContext,
    //private readonly app: NestFastifyApplication,
    private readonly utilService: FileUtilService,
  ) {}

  /**
   * This controller is used to upload file to local - temp folder - '/upload'
   * @param file
   * @param uploadFile
   */
  @ApiHeaders([
    {
      name: APP_CONSTANTS.HEADERS.FID_LOG_TRACKING_ID,
      description: 'Tracking id',
      required: true,
      example: '90aba85c-8078-441a-853f-055f9534d2a0',
    },
    {
      name: APP_CONSTANTS.HEADERS.FID_CONSUMER_APP_PROCESS,
      description: '',
      required: true,
      example: 'PM-90aba85c-8078-441a-853f-055f9534d2a0',
    },
    {
      name: APP_CONSTANTS.HEADERS.FID_PRINCIPAL_ROLE,
      description: 'Principal role Enum',
      required: true,
      enum: PrincipalRoleType,
    },
    { name: APP_CONSTANTS.HEADERS.FID_USER_TYPE, description: 'User type enum', required: true, enum: UserIdType },
    { name: APP_CONSTANTS.HEADERS.FID_USER_ID, description: 'UserId', required: true, example: 'axxxxxx' },
  ])
  @Put('/upload')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(RequestInterceptor, FileInterceptor('file', { preservePath: false }))
  public async uploadFile(@UploadedFile() file, @Body(new FileUploadPipe()) uploadFile: FileUploadModel) {
    console.log('coming here');
    return await this.fileStreamService.uploadFileToLocal(uploadFile, file);
  }

  @Get('/download/:names')
  public async downloadFile(
    @Param('names', new FilenamePipe(new FileValidationPipe())) fileName: string,
    @Res() resp: fastify.FastifyReply,
  ) {
    const destPath = await this.fileStreamService.downloadFiles(fileName);
    //console.log('what is app:', this.app);
    resp.headers({
      'Content-disposition': `attachment; filename=${fileName}.mp4`,
      'Content-type': 'video/mp4',
    });
    resp.send(fs.createReadStream(destPath));
  }

  @Get('/download/all')
  public async downloadAllVideos() {
    return this.fileStreamService.downloadAllFiles();
  }
}
