import { Body, Controller, Put, UploadedFile, UseInterceptors } from '@nestjs/common';
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

@Controller()
@ApiTags('Stream')
@UseInterceptors(HeaderInterceptor)
export class StreamController {
  constructor(private readonly fileStreamService: FileStreamService) {}

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
  @UseInterceptors(FileReqInterceptor, FileInterceptor('file', { preservePath: false }))
  public async uploadFile(@UploadedFile() file, @Body(new FileUploadPipe()) uploadFile: FileUploadModel) {
    return await this.fileStreamService.uploadFileToLocal(uploadFile, file);
  }
}
