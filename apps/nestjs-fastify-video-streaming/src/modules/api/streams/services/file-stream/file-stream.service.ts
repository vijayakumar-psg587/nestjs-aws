import { Injectable, Scope } from '@nestjs/common';
import { FileUploadModel } from '../../models/file-upload.model';
import { APP_CONSTANTS } from '../../../../shared/utils/app.constants';
import { plainToClass } from 'class-transformer';
import { CommonOutputResponse } from '../../models/common-output.response';
import { AppUtilService } from '../../../../shared/services/app-util/app-util.service';
import { VideoFileValidator } from '../../validators/file-type.validator';
import { FileUtilService } from '../file-util/file-util.service';
import * as path from 'path';
import * as fs from 'fs';
import archiver = require('archiver');
@Injectable({
  scope: Scope.REQUEST,
})
export class FileStreamService {
  destination;
  constructor(private readonly utilService: FileUtilService) {}

  /**
   * This method allows to download from local
   */
  async downloadFiles(fileName: string): Promise<string> {
    // download the files listed alone
    // fow now harcode it
    await this.utilService.createFileReadStream(fileName);
    // once we have the file in download folder , send it in the response - means pump the stream
    // get the path of the file
    return Promise.resolve(path.join(process.cwd(), `/download/${fileName}.mp4`));
  }

  async downloadAllFiles() {
    // use the archiver to download the files from upload folder location
    const uploadPath = path.join(process.cwd(), 'upload');
    return FileUtilService.createZip(uploadPath);
  }

  /**
   * This method uploads to local  - within the app
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
