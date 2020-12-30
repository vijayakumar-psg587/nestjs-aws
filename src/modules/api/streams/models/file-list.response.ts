import {Expose, Type} from "class-transformer";
import {FileUploadModel} from "./file-upload.model";

export class FileListResponse {
    @Expose({name: 'fileList'})
    @Type(() => FileUploadModel)
    fileList: FileUploadModel[];
}