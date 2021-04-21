import {Exclude, Expose, Type} from "class-transformer";
import { S3FileMetadataModel } from "../s3-file-metadata.model";
import {IsNotEmpty} from "class-validator";

export class S3UploadObjectModel {
    @Expose( { name: 'bucketName' } )
    name: string;
    @Expose()
    type?: string;
    // metadata if passed should be excluded when json is deserialzied to obj
   // @Expose({name: 'metadata'} )
   // @Type(() => S3FileMetadataModel)
    @Exclude()
    metadata?: S3FileMetadataModel;
}
