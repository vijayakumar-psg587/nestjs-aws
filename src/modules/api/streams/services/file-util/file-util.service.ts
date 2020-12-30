import { Injectable, Scope } from '@nestjs/common';
import { FileUploadModel } from '../../models/file-upload.model';
import { Readable } from 'stream';
import * as fs from 'fs';
import * as path from 'path';
import * as pump from 'pump';
import { AppConfigService } from '../../../../shared/services/app-config/app-config.service';
import { AppUtilService } from '../../../../shared/services/app-util/app-util.service';
import { APP_CONSTANTS } from '../../../../shared/utils/app.constants';
import archiver = require('archiver');

@Injectable({
  scope: Scope.REQUEST,
})
export class FileUtilService {
  constructor() {}

  async writeVideoToDrive(buffer: Buffer, fileModel: FileUploadModel, fileType: string, isLocal: boolean = true, isS3: boolean = false) {
    let writeStream: fs.WriteStream;
    if (isLocal) {
      writeStream = fs.createWriteStream(path.join(`${process.cwd()}/upload/${fileModel.name}.${fileType}`));
    }
    // use pump of pipeline since they take care of closing/destroying the streams on error and prevent
    //memory leakage
    pump(this.bufferToStream(buffer), writeStream, err => {
      console.log(err);
      if (err) {
        throw AppConfigService.getCustomError('FID-CUSTOM', 'Error uploading data' + err);
      }
    });
  }

  /**
   * This util method takes care of converting buffer to stream
   * @param buffer
   */
  bufferToStream(buffer) {
    const stream = new Readable({ highWaterMark: 4096 });
    stream.push(buffer);
    stream.push(null);
    return stream;
  }

  async *generateData(dataToBeGenerated: any) {
    for (const chunk of dataToBeGenerated) {
      yield chunk;
    }
  }

  /**
   * This method creates tag that is necessary fr bucket or object creation
   * @param isS3Bucket
   * @param isS3Obj
   */
  createTags(isS3Bucket: boolean = false, isS3Obj: boolean = false): AWS.S3.Tag[] {
    const objList = new Array<AWS.S3.Tag>();
    if (isS3Bucket) {
      objList.push({ Key: 'bucket', Value: 'true' });
    } else if (isS3Obj) {
      objList.push({ Key: 'object', Value: 'true' });
    }
    objList.push({ Key: 'app-name', Value: APP_CONSTANTS.COMMON.APP_NAME });
    objList.push({
      Key: 'env',
      Value: AppUtilService.checkForDev(process.env.NODE_ENV) ? 'development' : 'production',
    });
    return objList;
  }

  /**
   * This is used to create cors config obj that will be used in S3 bucket params
   */
  static createCorsConfig() {
    return {
      CORSRules: [
        {
          AllowedHeaders: ['*'],
          AllowedMethods: ['PUT', 'POST', 'DELETE'],
          AllowedOrigins: ['*'],
          ExposeHeaders: ['x-amz-server-side-encryption', 'ETag'],
          MaxAgeSeconds: 3000,
        },
        {
          AllowedHeaders: ['Authorization'],
          AllowedMethods: ['GET'],
          AllowedOrigins: ['*'],
          MaxAgeSeconds: 3000,
        },
      ],
    };
  }

  // This method creates zipped content
  static createZip(destination: string) {
    const archive = archiver('zip');
    archive.on('error', function(err) {
      throw err;
    });
    archive.directory(destination, false);
    archive.finalize();
    return archive;
  }
}
