import { APP_CONSTANTS } from '../../../shared/utils/app.constants';
import { VideoTypeEnum } from '../models/enums/video-type.enum';
import { FileUploadModel } from '../models/file-upload.model';
import { AppConfigService } from '../../../shared/services/app-config/app-config.service';
import { BucketModel } from '../models/s3/bucket.model';

export const VideoFileValidator = (target: any, key: string, descriptor: PropertyDescriptor) => {
  const originalMethod = descriptor.value;
  descriptor.value = async function(...args) {
    // get the file from the list of arguments - Eliminate all args that are not fileObj
    let fileObj = args.filter(arg => {
      if (arg instanceof FileUploadModel || arg instanceof BucketModel) {
        return false;
      } else {
        return true;
      }
    });
    console.log('fuleObjModel:', fileObj);
    // after getting the fileObj make sure to check for only VideoTypes from enum
    const fileName = fileObj[0]['mimetype'];
    const ext = fileName.substr(fileName.lastIndexOf(APP_CONSTANTS.CHAR.SLASH) + 1, fileName.length - 1);
    const typeFlag = Object.values(VideoTypeEnum).filter(val => val === ext).length > 0;
    if (typeFlag) {
      return originalMethod.apply(this, args);
    } else {
      throw AppConfigService.getCustomError(
        'FID-CUSTOM',
        `File is not a video type - Only files of types ${Object.values(VideoTypeEnum).join(',')} are allowed`,
      );
    }
  };
};
