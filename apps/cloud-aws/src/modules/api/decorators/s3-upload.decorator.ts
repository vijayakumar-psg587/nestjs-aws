import { AppConfigService } from "../../shared/services/app-config/app-config.service";
import { AppUtilService } from "../../shared/services/app-util/app-util.service";
import { ErrorTypes } from "../../shared/models/enums/error/error-types.enum";
import {S3UploadObjectModel} from "../models/req-res/s3-upload-object.model";
import {API_AWS_CONST} from "../../core/util/api-aws.constants";
import { FileTypeEnum } from "../models/enums/file-type.enum";
import { S3FileMetadataModel } from "../models/s3-file-metadata.model";

export const ValidateS3ObjectMedata = (target: Object, property: string, descriptor: PropertyDescriptor) => {
    console.log( 'seeing target:', target );
    console.log( 'seeing pro:', property );
    console.log( 'dsecript:', descriptor.value );

    const originalMethod = descriptor.value;

    // modifying it now
    descriptor.value = async function ( ...args ) {
        // check if the argument has the metadata required for upload
        console.log( 'args is:', args );
        try {
            // the first argument here is S3ObjectModel
            const objModel =  args[0] as S3UploadObjectModel;
            const fileData = args[1]; // This is a multer file type
            // TODO: employ a regex way of testing for the "name"
            console.log( Object.values( FileTypeEnum ) );
            console.log( objModel.type );
            if ( Object.values( FileTypeEnum ).filter( item => item.toLowerCase() === objModel.type.toLocaleLowerCase() ).length >= 1 ) {
                objModel.metadata = new S3FileMetadataModel();
                objModel.metadata.size = args[1]['size'];
                objModel.metadata.createdTimeStamp = '<Default user>';
                objModel.metadata.createdTimeStamp = AppUtilService.getDefaultUTCTime();
                console.log('printing args0 again:', args[0])
                const result = await originalMethod.apply( this, args );
                return result;
            } else {
                throw AppUtilService.handleCustomException( 400, ErrorTypes.VALIDATION, 'Request File type is not valid' );
            } 

            

        } catch ( err ) {
            console.log( 'there is err while validating:', err );
            throw AppUtilService.handleCustomException(451, ErrorTypes.VALIDATION, 'Error in validating s3 upload obj:'+err.message);
        }
         
    }

    return descriptor;
}
