import {Injectable} from '@nestjs/common';
import {AWSUtilService} from "../../utils/aws-util/aws-util.service";
import * as AWS from 'aws-sdk';
import {AwsServicesConfigModel} from "../../models/aws-services-config.model";
import {AppUtilService} from "../../../shared/services/app-util/app-util.service";
import {ErrorTypes} from "../../../shared/models/enums/error/error-types.enum";
import {S3BucketModel} from "../../models/s3-bucket.model";
import {BucketCRModel} from "../../models/req-res/bucket-c-r.model";
import { ValidateS3ObjectMedata } from '../../decorators/s3-upload.decorator';
import { S3UploadObjectModel } from '../../models/req-res/s3-upload-object.model';
import { CustomErrorModel } from '../../../shared/models/exception/custom-error.model';
import { API_AWS_CONST } from '../../../core/util/api-aws.constants';

@Injectable()
export class S3Service {
    private awsConfig: AWS.S3;
    private awsServiceConfig: AwsServicesConfigModel;

    constructor() {
        this.awsServiceConfig = AWSUtilService.getAWSServiceConfig();
        this.awsConfig = new AWS.S3({
            apiVersion: this.awsServiceConfig.s3Version,
            maxRedirects: 4,
            maxRetries: 3,
            accessKeyId: this.awsServiceConfig.accessKeyId,
            secretAccessKey: this.awsServiceConfig.secretKeyId,
            region: this.awsServiceConfig.region
        });
    }

    public async createBucketIfEmpty(bucketModel: BucketCRModel) {
        // call the util service to check this
        return new Promise(async (res, rej) => {
            try {
                const bucketData: S3BucketModel = await AWSUtilService.getListOfBuckets(this.awsConfig);
                console.log('bucketListData:', bucketData);
                if (bucketData && bucketData.Buckets && bucketData.Buckets.length >= 1
                        && bucketData.Buckets.filter(item => {
                            console.log(' two names: ', item.Name.toLowerCase(), bucketModel.name.toLowerCase())
                            return item.Name.toLowerCase() === bucketModel.name.toLowerCase()
                        } ).length >= 1) {
                    const errObj = AppUtilService.handleCustomException(435, ErrorTypes.VALIDATION, 'Bucket with same name already exists');
                    rej(errObj);
                }
                // if it doesnt exist then create bucket
                this.awsConfig.createBucket({
                    ACL: bucketModel.acl,
                    Bucket: bucketModel.name
                }, (err, data) => {
                    if (err) {
                        console.log('err creating bucket:', err);
                        rej(AppUtilService.handleCustomException(500, ErrorTypes.AWS, err["code"] + " Bucket cannot be created"));
                    }
                    console.log('gettin data here:', data);
                    res(data);
                })

            } catch (err) {
                rej(AppUtilService.handleCustomException(500, ErrorTypes.AWS, err.message));
            }
        })
    }

    public async deleteBucket(bucketModel: BucketCRModel) {
        return new Promise(async (res, rej) => {
            const bucketData: S3BucketModel = await AWSUtilService.getListOfBuckets(this.awsConfig);
            if (bucketData && bucketData.Buckets && bucketData.Buckets.length >= 1
                    && bucketData.Buckets.filter(item => item.Name.toLowerCase() === bucketModel.name.toLowerCase()).length >= 1) {
                // bucket exists so delete it
                this.awsConfig.deleteBucket({
                    Bucket: bucketModel.name
                }, (err, data) => {
                    if(err) {
                        rej(AppUtilService.handleCustomException(500, ErrorTypes.AWS,err["code"] ))
                    }
                    res(data);
                });
            } else {
                rej(AppUtilService.handleCustomException(433, ErrorTypes.AWS, "No bucket exists to delete"))
            }
        });
    }

    @ValidateS3ObjectMedata
    public async streamFilesToS3Bucket(s3Obj: S3UploadObjectModel, file: unknown) {
        // Using the above decorator , validate if file is of valid input types and then modify the metadata info and send it back
        // first check if a bucket exists under the given name
        try {
            // await this.createBucketIfEmpty( { name: s3Obj.name } );
            return new Promise( async ( resolve, reject ) => {
                try {
                   
                   
                    const result = await AWSUtilService.writeVideoToDrive( file, s3Obj );
                    // after upload to local, we can use manageupload to S3 . prev was not need. but just done fr learning purposes
                    
                    // now get the stream data from local
                    const readStream = AWSUtilService.bufferToStream( file['buffer'] );
                    // for managed upload, need to create new AWS S3
                    // Key is the name of the file with which it will be store
                    const params = { Bucket: s3Obj['bucketName'], Key: API_AWS_CONST.COMMON.APP_NAME + file['originalname'], Body: readStream }
                    console.log('params here:', params)
                    const uploadS3 = new AWS.S3.ManagedUpload( {
                        service: this.awsConfig,
                        leavePartsOnError: false,
                        params: params,
                        tags: [{ Key: 'key1', Value: 'value1'}]
                    });
                    
                
                    const asyncUpload = uploadS3.promise();
                    console.log( 'coming befr actaul upload', uploadS3 );
                    
                    resolve( asyncUpload.then( ( uploadedData ) => {
                        console.log( 'uploaded now:', uploadedData );
                        return uploadedData;
                    }, ( err ) => {
                        console.log( 'err in uploadin data:', err );
                        const errModel = AppUtilService.handleCustomException( 500, ErrorTypes.AWS, 'Error uploading data:' + err.message );
                        return errModel;
                    } ) );
                    

                } catch ( err ) {
                    console.log( err );

                    reject( err );

                }
            } );
        } catch ( err ) {
            return Promise.reject( err );
        }
        
         
    }


}
