import { Body, Controller, Get, Post, Put, Query, Res, UploadedFile, UseInterceptors } from '@nestjs/common';
import { ApiConsumes, ApiHeaders, ApiProduces, ApiTags } from '@nestjs/swagger';
import { APP_CONSTANTS } from '../../../../shared/utils/app.constants';
import { PrincipalRoleType } from '../../../../shared/models/enums/headers/principal-role-type.enum';
import { UserIdType } from '../../../../shared/models/enums/headers/user-id-type.enum';
import { FileReqInterceptor } from '../../interceptors/file-req.interceptor';
import { FileInterceptor } from '@webundsoehne/nest-fastify-file-upload';
import { S3Service } from '../../services/s3/s3.service';
import { BucketModel } from '../../models/s3/bucket.model';
import { FileUploadPipe } from '../../pipes/file-upload.pipe';
import { FastifyReply } from 'fastify';

@ApiTags('AWS-S3-Crud')
@Controller('aws-s3')
export class AwsS3Controller {
  constructor(private readonly s3Service: S3Service) {}

  /**
     * THis endpoint is used to create new bucket - Use bucketModel with just a name, only one can be created
     * ex: {
	        "name": "<bucketName>"
        }
     * @param bucketModel
     */
  @ApiHeaders([
    {
      name: APP_CONSTANTS.HEADERS.FID_LOG_TRACKING_ID,
      description: 'Tracking id',
      required: true,
      example: '90aba85c-8078-441a-853f-055f9534d2a0',
    },
    {
      name: APP_CONSTANTS.HEADERS.FID_CONSUMER_APP_PROCESS,
      description: '',
      required: true,
      example: 'PM-90aba85c-8078-441a-853f-055f9534d2a0',
    },
    {
      name: APP_CONSTANTS.HEADERS.FID_PRINCIPAL_ROLE,
      description: 'Principal role Enum',
      required: true,
      enum: PrincipalRoleType,
    },
    { name: APP_CONSTANTS.HEADERS.FID_USER_TYPE, description: 'User type enum', required: true, enum: UserIdType },
    { name: APP_CONSTANTS.HEADERS.FID_USER_ID, description: 'UserId', required: true, example: 'axxxxxx' },
  ])
  @Put('/bucket')
  public async createFolder(@Body() bucketModel: BucketModel) {
    return await this.s3Service.createBucket(bucketModel);
  }

  /**
   * This lists all the buckets for the give account
   */
  @ApiHeaders([
    {
      name: APP_CONSTANTS.HEADERS.FID_LOG_TRACKING_ID,
      description: 'Tracking id',
      required: true,
      example: '90aba85c-8078-441a-853f-055f9534d2a0',
    },
    {
      name: APP_CONSTANTS.HEADERS.FID_CONSUMER_APP_PROCESS,
      description: '',
      required: true,
      example: 'PM-90aba85c-8078-441a-853f-055f9534d2a0',
    },
    {
      name: APP_CONSTANTS.HEADERS.FID_PRINCIPAL_ROLE,
      description: 'Principal role Enum',
      required: true,
      enum: PrincipalRoleType,
    },
    { name: APP_CONSTANTS.HEADERS.FID_USER_TYPE, description: 'User type enum', required: true, enum: UserIdType },
    { name: APP_CONSTANTS.HEADERS.FID_USER_ID, description: 'UserId', required: true, example: 'axxxxxx' },
  ])
  @Get('/bucket/all')
  @ApiProduces('application/json')
  public async listAllBuckets() {
    return this.s3Service.listAllBuckets(false);
  }

  /**
     * This end point gets all the objects inside a given bucket - input a bucket name in the bucketmode
     * ex: {
	        "name": "<bucketName>"
        }
     * @param bucketName
     */
  @ApiHeaders([
    {
      name: APP_CONSTANTS.HEADERS.FID_LOG_TRACKING_ID,
      description: 'Tracking id',
      required: true,
      example: '90aba85c-8078-441a-853f-055f9534d2a0',
    },
    {
      name: APP_CONSTANTS.HEADERS.FID_CONSUMER_APP_PROCESS,
      description: '',
      required: true,
      example: 'PM-90aba85c-8078-441a-853f-055f9534d2a0',
    },
    {
      name: APP_CONSTANTS.HEADERS.FID_PRINCIPAL_ROLE,
      description: 'Principal role Enum',
      required: true,
      enum: PrincipalRoleType,
    },
    { name: APP_CONSTANTS.HEADERS.FID_USER_TYPE, description: 'User type enum', required: true, enum: UserIdType },
    { name: APP_CONSTANTS.HEADERS.FID_USER_ID, description: 'UserId', required: true, example: 'axxxxxx' },
  ])
  @Get('/bucket')
  @ApiProduces('application/json')
  public async listAllObjectsForTheGivenBucket(@Query('bucketName') bucketName: string) {
    return this.s3Service.listBucketObjects(bucketName);
  }

  /**
   * This is used to create objects and upload the content as is:
   * NOTE!! - Not at all suited for large files, since the content is uploaded as buffer
   * This uses multipart form data -  the form should contain fileData which is a nestedObject of bucket
   * Since its a multipart input, nested objects should be entered as below
   * ex:
   * name: bucket-name
   * folder: folder-under-which-obj-is-to-be-created
   * fileObj[0][fileName] - name-of-obj-to-be-created
   * fileModel.file - Buffer-t-be-uploaded
   * fileObj[0][type] - mp4
   *
   *
   * @param file
   * @param bucketModel
   */
  @ApiHeaders([
    {
      name: APP_CONSTANTS.HEADERS.FID_LOG_TRACKING_ID,
      description: 'Tracking id',
      required: true,
      example: '90aba85c-8078-441a-853f-055f9534d2a0',
    },
    {
      name: APP_CONSTANTS.HEADERS.FID_CONSUMER_APP_PROCESS,
      description: '',
      required: true,
      example: 'PM-90aba85c-8078-441a-853f-055f9534d2a0',
    },
    {
      name: APP_CONSTANTS.HEADERS.FID_PRINCIPAL_ROLE,
      description: 'Principal role Enum',
      required: true,
      enum: PrincipalRoleType,
    },
    { name: APP_CONSTANTS.HEADERS.FID_USER_TYPE, description: 'User type enum', required: true, enum: UserIdType },
    { name: APP_CONSTANTS.HEADERS.FID_USER_ID, description: 'UserId', required: true, example: 'axxxxxx' },
  ])
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileReqInterceptor, FileInterceptor('file', { preservePath: false }))
  @Put('/bucket/object')
  public async createObject(@UploadedFile() file, @Body(FileUploadPipe) bucketModel: BucketModel) {
    return await this.s3Service.createObjectForBucket(bucketModel, file);
  }

  @ApiHeaders([
    {
      name: APP_CONSTANTS.HEADERS.FID_LOG_TRACKING_ID,
      description: 'Tracking id',
      required: true,
      example: '90aba85c-8078-441a-853f-055f9534d2a0',
    },
    {
      name: APP_CONSTANTS.HEADERS.FID_CONSUMER_APP_PROCESS,
      description: '',
      required: true,
      example: 'PM-90aba85c-8078-441a-853f-055f9534d2a0',
    },
    {
      name: APP_CONSTANTS.HEADERS.FID_PRINCIPAL_ROLE,
      description: 'Principal role Enum',
      required: true,
      enum: PrincipalRoleType,
    },
    { name: APP_CONSTANTS.HEADERS.FID_USER_TYPE, description: 'User type enum', required: true, enum: UserIdType },
    { name: APP_CONSTANTS.HEADERS.FID_USER_ID, description: 'UserId', required: true, example: 'axxxxxx' },
  ])

  /**
   * THis uses a managed upload format - still a little slower
   * * ex:
   * name: bucket-name
   * folder: folder-under-which-obj-is-to-be-created
   * fileObj[0][fileName] - name-of-obj-to-be-created
   * fileModel.file - Buffer-t-be-uploaded
   * fileObj[0][type] - mp4
   *
   */
  @Put('/bucket/upload')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileReqInterceptor, FileInterceptor('file', { preservePath: false }))
  public async uploadFile(@UploadedFile() file, @Body(FileUploadPipe) bucket: BucketModel) {
    return this.s3Service.managedUploadFileToFolder(bucket, file);
  }

  /**
   * This uses a better way of handling uploads for larger files
   * * ex:
   * name: bucket-name
   * folder: folder-under-which-obj-is-to-be-created
   * fileObj[0][fileName] - name-of-obj-to-be-created
   * fileModel.file - Buffer-t-be-uploaded
   * fileObj[0][type] - mp4
   *
   */
  @ApiHeaders([
    {
      name: APP_CONSTANTS.HEADERS.FID_LOG_TRACKING_ID,
      description: 'Tracking id',
      required: true,
      example: '90aba85c-8078-441a-853f-055f9534d2a0',
    },
    {
      name: APP_CONSTANTS.HEADERS.FID_CONSUMER_APP_PROCESS,
      description: '',
      required: true,
      example: 'PM-90aba85c-8078-441a-853f-055f9534d2a0',
    },
    {
      name: APP_CONSTANTS.HEADERS.FID_PRINCIPAL_ROLE,
      description: 'Principal role Enum',
      required: true,
      enum: PrincipalRoleType,
    },
    { name: APP_CONSTANTS.HEADERS.FID_USER_TYPE, description: 'User type enum', required: true, enum: UserIdType },
    { name: APP_CONSTANTS.HEADERS.FID_USER_ID, description: 'UserId', required: true, example: 'axxxxxx' },
  ])
  @Put('/bucket/stream-upload')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileReqInterceptor, FileInterceptor('file', { preservePath: false }))
  public async streamUpload(@UploadedFile() file, @Body(FileUploadPipe) bucket: BucketModel) {
    return await this.s3Service.streamFileUpload(bucket, file);
  }

  /**
     * This is used to download a single file obj. The i/p should have the correct bucket name and the __filename
     * The "folder" name is not taken into accnt here
     * {
	"name": "test-bucket-name",
	"folder":"test-folder-name",
	"fileObj": {
		"fileName":"file-name"
	}
}
     * @param bucket
     * @param resp
     */
  @ApiHeaders([
    {
      name: APP_CONSTANTS.HEADERS.FID_LOG_TRACKING_ID,
      description: 'Tracking id',
      required: true,
      example: '90aba85c-8078-441a-853f-055f9534d2a0',
    },
    {
      name: APP_CONSTANTS.HEADERS.FID_CONSUMER_APP_PROCESS,
      description: '',
      required: true,
      example: 'PM-90aba85c-8078-441a-853f-055f9534d2a0',
    },
    {
      name: APP_CONSTANTS.HEADERS.FID_PRINCIPAL_ROLE,
      description: 'Principal role Enum',
      required: true,
      enum: PrincipalRoleType,
    },
    { name: APP_CONSTANTS.HEADERS.FID_USER_TYPE, description: 'User type enum', required: true, enum: UserIdType },
    { name: APP_CONSTANTS.HEADERS.FID_USER_ID, description: 'UserId', required: true, example: 'axxxxxx' },
  ])
  @Post('/bucket/objects/stream-download')
  @ApiProduces('')
  public async streamDownloadFiles(@Body() bucket: BucketModel, @Res() resp: FastifyReply) {
    return this.s3Service.streamSingleFileDownload(bucket, resp);
    // If you wanted to download the files as zipped ones, below format works
    // get the file names as query param and proceed - this streams the o/p as zipped format from temp folder -download
    // return resp.send(await this.s3Service.streamFilesDownload(fileNames));
  }

  /**
   * This downloads all the objects in a bucket . Bucket name should be more than enough
   *
   * @param bucket
   */
  @ApiHeaders([
    {
      name: APP_CONSTANTS.HEADERS.FID_LOG_TRACKING_ID,
      description: 'Tracking id',
      required: true,
      example: '90aba85c-8078-441a-853f-055f9534d2a0',
    },
    {
      name: APP_CONSTANTS.HEADERS.FID_CONSUMER_APP_PROCESS,
      description: '',
      required: true,
      example: 'PM-90aba85c-8078-441a-853f-055f9534d2a0',
    },
    {
      name: APP_CONSTANTS.HEADERS.FID_PRINCIPAL_ROLE,
      description: 'Principal role Enum',
      required: true,
      enum: PrincipalRoleType,
    },
    { name: APP_CONSTANTS.HEADERS.FID_USER_TYPE, description: 'User type enum', required: true, enum: UserIdType },
    { name: APP_CONSTANTS.HEADERS.FID_USER_ID, description: 'UserId', required: true, example: 'axxxxxx' },
  ])
  @Post('/bucket/objects/all/stream-download')
  @ApiProduces('')
  public async streamDownloadAllFiles(@Body() bucket: BucketModel) {
    return this.s3Service.streamMultipleFileDownload(bucket);
    // If you wanted to download the files as zipped ones, below format works
    // return resp.send(await this.s3Service.streamFilesDownload(fileNames));
  }
}
