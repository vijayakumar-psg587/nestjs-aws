import { FileMetadataModel } from './file-metadata.model';
import { Expose } from 'class-transformer';

export class FileUploadModel {
  @Expose({ name: 'fileName' })
  name: string;
  @Expose()
  type?: string;
  // metadata if passed should be excluded when json is deserialzied to obj
  @Expose({ name: 'metadata' })
  metadata: FileMetadataModel;
}
