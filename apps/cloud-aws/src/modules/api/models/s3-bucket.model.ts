import {Expose, Transform, Type} from "class-transformer";
import {S3BucketMetadataModel} from "./s3-bucket-metadata.model";
import {OwnerMetadataModel} from "./owner-metadata.model";

export class S3BucketModel {
    @Expose({name: 'Buckets'})
    @Type(() => S3BucketMetadataModel)
    Buckets: S3BucketMetadataModel[];

    @Expose({name: 'Owner'})
    @Type(() => OwnerMetadataModel)
    Owner: OwnerMetadataModel;
}
