import { ArgumentMetadata, Injectable, PipeTransform } from '@nestjs/common';
import { FileUploadModel } from '../models/file-upload.model';
import { AppConfigService } from '../../../shared/services/app-config/app-config.service';
import { FileMetadataModel } from '../models/file-metadata.model';
import { AppUtilService } from '../../../shared/services/app-util/app-util.service';
import { BucketModel } from '../models/s3/bucket.model';

@Injectable()
export class FileUploadPipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata) {
    if (metadata.type === 'body') {
      // then transform the value to fileUploadModel adding in few other defaults
      let deserialziedInp = null;

      if (value && value['name']) {
        console.log('coming in here');
        // then definitely its a bucketModel
        deserialziedInp = value as BucketModel;
      } else {
        deserialziedInp = value as FileUploadModel;
      }

      if (!deserialziedInp) {
        // then throw validation Error
        throw AppConfigService.getCustomError('VALIDATION', 'Input request is not of a proper format');
      } else {
        if (deserialziedInp instanceof FileUploadModel) {
          deserialziedInp.metadata = new FileMetadataModel();
          deserialziedInp.metadata.createdBy = '<DefaultUser>';
          deserialziedInp.metadata.createdTimeStamp = AppUtilService.defaultISOTime();
        } else if (deserialziedInp instanceof BucketModel) {
          deserialziedInp.fileData.metadata = new FileMetadataModel();
          deserialziedInp.fileData.metadata.createdBy = '<DefaultUser>';
          deserialziedInp.fileData.metadata.createdTimeStamp = AppUtilService.defaultISOTime();
        }
        return deserialziedInp;
      }
    }
    return value;
  }
}
