import { Expose, Type } from 'class-transformer';
import { BucketMetadataModel } from './bucket-metadata.model';
import { FileUploadModel } from '../file-upload.model';

export class BucketModel {
  @Expose()
  name: string;
  @Expose()
  folder?: string;
  @Expose({ name: 'metadata' })
  bucketMetadata?: BucketMetadataModel;
  @Expose({ name: 'fileObj' })
  @Type(() => FileUploadModel)
  fileData: FileUploadModel;
}
