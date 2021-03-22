import {Expose} from "class-transformer";

export class FileMetadataModel {
    @Expose()
    size: string; // in bytes
    @Expose()
    createdTimeStamp: string;
    @Expose()
    createdBy: string;
}