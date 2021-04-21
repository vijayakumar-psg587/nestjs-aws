import { Expose } from "class-transformer";

export class S3FileMetadataModel {
    @Expose()
    size: number; // in bytes
    @Expose()
    createdTimeStamp: string;
    @Expose()
    createdBy: string;
}
