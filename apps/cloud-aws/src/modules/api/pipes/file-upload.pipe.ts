import {ArgumentMetadata, Injectable, PipeTransform} from '@nestjs/common';
import {AppUtilService} from "../../shared/services/app-util/app-util.service";
import {ErrorTypes} from "../../shared/models/enums/error/error-types.enum";
import {S3UploadObjectModel} from "../models/req-res/s3-upload-object.model";
import {S3FileMetadataModel} from "../models/s3-file-metadata.model";
import {deserialize} from "class-transformer";

@Injectable()
export class FileUploadPipe implements PipeTransform {
    transform(value: any, metadata: ArgumentMetadata) {
        if (metadata.type === 'body') {

            const deserializedIp = value as S3UploadObjectModel;
            console.log('deserialzied :', deserializedIp);
            return deserializedIp;
        } else {
            throw AppUtilService.handleCustomException(400, ErrorTypes.VALIDATION, 'Input does not contain required form body')
        }

    }
}
