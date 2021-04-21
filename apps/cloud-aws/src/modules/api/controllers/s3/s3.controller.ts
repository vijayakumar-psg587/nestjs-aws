import {
    Body,
    Controller,
    Delete,
    Get,
    HttpCode,
    HttpStatus,
    Post,
    Put,
    UploadedFile,
    UseInterceptors
} from '@nestjs/common';
import {S3Service} from "../../services/s3/s3.service";
import {HeaderInterceptor} from "../../interceptors/header.interceptor";
import {AwsModelInterceptor} from "../../interceptors/aws-model.interceptor";
import {BucketCRModel} from "../../models/req-res/bucket-c-r.model";
import { S3UploadObjectModel } from '../../models/req-res/s3-upload-object.model';
import {ReqFileInterceptor} from "../../interceptors/req-file.interceptor";
import {FileInterceptor} from "@webundsoehne/nest-fastify-file-upload";
import {FileUploadPipe} from "../../pipes/file-upload.pipe";

@Controller('s3')
@UseInterceptors(HeaderInterceptor, AwsModelInterceptor)
export class S3Controller {
    constructor(private readonly s3Service: S3Service) {
    }

    @Put('/bucket')
    @HttpCode(201)
    public async createBucket(@Body() bucketModel: BucketCRModel) {
        console.log('bucketModel is:', bucketModel);
        try {
            const deleteObj = await this.s3Service.createBucketIfEmpty(bucketModel);
        } catch(err) {
            console.log('coming in err in controller:', err);
            throw err;
        }

    }

    @Get('/bucket')
    public async getAllBucketsWithFolders() {}

    @Delete('/bucket')
    @HttpCode(201)
    public async deleteBuckets(@Body() deleteBucket: BucketCRModel) {
        console.log('delete bucket data:', deleteBucket);
        try {
            return await this.s3Service.deleteBucket(deleteBucket);
        }catch(err) {
            throw err;
        }
    }

    @Put('/bucket/obj')
    @UseInterceptors(ReqFileInterceptor, FileInterceptor('fileName' ))
    public async createS3Objects(@UploadedFile() file,  @Body(FileUploadPipe) s3Obj: S3UploadObjectModel ) {
        try {
            console.log('s3Obj:', s3Obj, file);
           return await this.s3Service.streamFilesToS3Bucket(s3Obj, file);
        } catch ( err ) {
            console.log( 'err in controller:', err);
            throw err;
        }
        return 'Done'

    }

    @Get('/bucket/obj')
    public async listAllS3Objects() {
        return 'Done'

    }

}
