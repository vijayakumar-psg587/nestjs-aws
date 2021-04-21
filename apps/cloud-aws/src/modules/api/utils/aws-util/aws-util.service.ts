import {Injectable, Scope} from '@nestjs/common';
import {AwsServicesConfigModel} from "../../models/aws-services-config.model";
import * as util from 'util';
import {plainToClass} from "class-transformer";
import { S3BucketModel } from "../../models/s3-bucket.model";
import * as fs from 'fs';
import * as pump from 'pump';
import * as path from 'path';
import { Readable, pipeline } from 'stream';
import { AppUtilService } from '../../../shared/services/app-util/app-util.service';
import { ErrorTypes } from '../../../shared/models/enums/error/error-types.enum';
import { S3UploadObjectModel } from '../../models/req-res/s3-upload-object.model';
import { WriteStream } from 's3-streams';
import AWS from 'aws-sdk';
import { API_AWS_CONST } from '../../../core/util/api-aws.constants';
const zlib = require( 'zlib' );

@Injectable({
    scope: Scope.DEFAULT
})
export class AWSUtilService {
   private static servicesConfig: AwsServicesConfigModel;

    static getAWSServiceConfig(): AwsServicesConfigModel {
        if(!AWSUtilService.servicesConfig) {
            // fetch from environment
            AWSUtilService.servicesConfig = new AwsServicesConfigModel();
            AWSUtilService.servicesConfig.ec2Version = process.env.AWS_EC2_API_VERSION;
            AWSUtilService.servicesConfig.kinesisVersion = process.env.AWS_KINESIS_API_VERSION;
            AWSUtilService.servicesConfig.s3Version = process.env.AWS_S3_API_VERSION;
            AWSUtilService.servicesConfig.accessKeyId = process.env.AWS_ACCESS_KEY_ID;
            AWSUtilService.servicesConfig.secretKeyId = process.env.AWS_SECRET_ACCESS_KEY;
            AWSUtilService.servicesConfig.region = process.env.AWS_DEFAULT_REGION;
        }
        console.log('getting serviceConfig:', AWSUtilService.servicesConfig)
        return  AWSUtilService.servicesConfig;
    }
    static async getListOfBuckets(awsS3Config: AWS.S3): Promise<S3BucketModel>  {
         const listBucketPromisify =  util.promisify(awsS3Config.listBuckets);
         return new Promise((resolve, reject) => {
             awsS3Config.listBuckets((err, data) => {
                 console.log('coming in data:', data);
                 if(err) {
                     console.log('err getting buckets:', err);
                    reject(err);
                 }
                 resolve(plainToClass(S3BucketModel, data));
             })
         })

    }

    static createParamsForManagedUpload( stream, bucketName: string, keyPath: string ) {
        return { Bucket: name, Key: keyPath, Body: stream }

    }

    static async writeVideoToDrive( fileObjDetails, s3Obj: S3UploadObjectModel ) {
        return new Promise( (resolve, reject) => {
            try {
                const filePath = path.join( process.cwd(), '/upload', `${fileObjDetails['originalname']}` );
                const writeStream = fs.createWriteStream( filePath );
                pipeline( AWSUtilService.bufferToStream( fileObjDetails['buffer'] ), writeStream, err => {
                    if ( err ) {
                        // then throw exception
                        console.log( 'err occured while piping from read to write stream:', err );
                        const errModel = AppUtilService.handleCustomException( 500, ErrorTypes.REQ, 'Read stream cannot be piped:' + err.message );
                        reject( errModel );

                    }
                    resolve( 'Done' );
                } )

            } catch ( err ) {
                console.log( 'err occured while writing to local:', err );
                const errModel = AppUtilService.handleCustomException( 500, ErrorTypes.REQ, 'Cannot create streams from the file uploaded:'+err.message );
                reject( errModel );
            }
            
        })        
        
    }

    /**
   * This util method takes care of converting buffer to stream
   * @param buffer
   */
    static bufferToStream( buffer ) {
        const stream = new Readable( { highWaterMark: 4096 } );
        stream.push( buffer );
        stream.push( null );
        return stream;
    }
}
