import { Injectable, Scope } from '@nestjs/common';
import { FileUploadModel } from '../../models/file-upload.model';
import { APP_CONSTANTS } from '../../../../shared/utils/app.constants';
import { plainToClass } from 'class-transformer';
import { CommonOutputResponse } from '../../models/common-output.response';
import { AppUtilService } from '../../../../shared/services/app-util/app-util.service';
import { VideoFileValidator } from '../../validators/file-type.validator';
import { FileUtilService } from '../file-util/file-util.service';

@Injectable({
  scope: Scope.REQUEST,
})
export class FileStreamService {
  constructor(private readonly utilService: FileUtilService) {}

  /**
   * This method uploads to local
   * @param fileModel
   * @param fileObj
   */

  @VideoFileValidator
  async uploadFileToLocal(fileModel: FileUploadModel, fileObj: any): Promise<CommonOutputResponse> {
    fileModel.metadata.size = '' + fileObj['size'];
    // Now validate if the fileObj contains a video mimetype- best to send the mimetype
    const mimeType: string = fileObj['mimetype'];
    return new Promise(async (resolve, reject) => {
      // the util service takes care of writing the stream
      await this.utilService.writeVideoToDrive(
        fileObj['buffer'],
        fileModel,
        mimeType.substring(mimeType.lastIndexOf(APP_CONSTANTS.CHAR.SLASH) + 1, mimeType.length),
      );
      resolve(
        plainToClass(CommonOutputResponse, {
          status: 'Success',
          timestamp: AppUtilService.defaultISOTime(),
          message: 'Uploaded Successfully',
        }),
      );
    });
  }
}
