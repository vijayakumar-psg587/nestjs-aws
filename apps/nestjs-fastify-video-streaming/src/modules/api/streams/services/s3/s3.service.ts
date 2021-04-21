import { Injectable, Scope } from '@nestjs/common';
import { BucketModel } from '../../models/s3/bucket.model';
import * as AWS from 'aws-sdk';
import * as fs from 'fs';
import * as path from 'path';
import { FileUtilService } from '../file-util/file-util.service';
import { AppConfigService } from '../../../../shared/services/app-config/app-config.service';
import { AppUtilService } from '../../../../shared/services/app-util/app-util.service';
import { plainToClass } from 'class-transformer';
import { CommonOutputResponse } from '../../models/common-output.response';
import { VideoFileValidator } from '../../validators/file-type.validator';
import { APP_CONSTANTS } from '../../../../shared/utils/app.constants';
import { Readable } from 'stream';
import * as async from 'async';
import { S3StreamUploader } from 's3-upload-stream';
import { FileStreamService } from '../file-stream/file-stream.service';
import { FastifyReply } from 'fastify';
import * as pump from 'pump';

const zlib = require('zlib');

@Injectable({
  scope: Scope.REQUEST,
})
export class S3Service {
  private s3: AWS.S3;
  private s3MangedUpload: AWS.S3.ManagedUpload;
  private s3Upload: S3StreamUploader;

  constructor(private utilService: FileUtilService, private readonly streamService: FileStreamService) {
    this.s3 = new AWS.S3({
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      maxRetries: 3,

      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      region: process.env.AWS_DEFAULT_REGION,
    });
    this.s3Upload = require('s3-upload-stream')(this.s3);
  }

  /**
   * Service method that takes care of bucket creation
   * @param bucket
   */
  async createBucket(bucket: BucketModel): Promise<CommonOutputResponse> {
    try {
      const bucketList: AWS.S3.Bucket[] | CommonOutputResponse = await this.listAllBuckets();
      return new Promise((res, rej) => {
        if (bucket && bucket.name) {
          if (
            !(bucketList instanceof CommonOutputResponse) &&
            bucketList.filter(s3Bucket => s3Bucket.Name.toUpperCase() === bucket.name.toUpperCase()).length === 0
          ) {
            // means there are such buckets found - so feel free to create one
            this.s3.createBucket({ Bucket: bucket.name }, (err, data) => {
              if (err) {
                console.log('S3 bucket cannot be created:', err);
                rej(AppConfigService.getCustomError('FID-S3-Custom', `${err.message}: code - ${err.code} - statusCode: ${err.statusCode}`));
              } else {
                // after creating the bucket, make sure to create additional props like cors
                this.s3.putBucketCors(
                  {
                    Bucket: bucket.name,
                    CORSConfiguration: FileUtilService.createCorsConfig(),
                  },
                  (err, corsData) => {
                    if (err) {
                      // cors config cannot be created
                      rej(
                        plainToClass(CommonOutputResponse, {
                          message: 'New bucket cannot be created -err with cors config' + err.message,
                          status: 'Failure',
                        }),
                      );
                    } else {
                      res(
                        plainToClass(CommonOutputResponse, {
                          message: `New Bucket created at location - ${data.Location}`,
                          status: 'Success',
                        }),
                      );
                    }
                  },
                );
              }
            });
          }
        } else {
          rej(
            plainToClass(CommonOutputResponse, {
              message: 'New bucket cannot be created -since already a bucket exist',
              status: 'Failure',
            }),
          );
        }
      });
    } catch (err) {
      throw err;
    }
  }

  /**
   * THis creates the folder and uploads the video to S3
   * @param bucket
   * @param file
   */
  // TODO: create multiple file uploads of different mimetypes and create respective validations
  @VideoFileValidator
  async createObjectForBucket(bucket: BucketModel, file: object) {
    // Creating object is actually  uploading files to the bucket
    // Surprising due to the flat structure of S3, it allows dynamic folder creations
    // before uploading the object. This is done via Keys
    console.log('final bucketModel - before:', bucket, file);
    bucket.fileData.metadata.size = '' + file['size'];
    console.log('final bucketModel:', bucket);
    return new Promise(async (resolve, reject) => {
      // incase if the bucket is not found, then just return a message
      try {
        const bucketList: AWS.S3.Bucket[] | CommonOutputResponse = await this.listAllBuckets();
        if (
          bucketList &&
          !(bucketList instanceof CommonOutputResponse) &&
          bucketList.filter(singleBucket => singleBucket.Name.toUpperCase() === bucket.name.toUpperCase()).length > 0
        ) {
          // means bucket exists - so object can be created
          // create params for upload
          const stream = this.utilService.bufferToStream(file['buffer']);
          // const tags = this.utilService.createTags(false, true);
          // console.log('tag:', encodeURIComponent(JSON.stringify(tags)));
          const metadata: AWS.S3.Metadata = JSON.parse(JSON.stringify(bucket.fileData.metadata));
          const keyFolder = bucket && bucket.folder ? APP_CONSTANTS.COMMON.APP_NAME + '/' + bucket.folder + '/' : 'tf-default-video';
          const putObjReq: AWS.S3.PutObjectRequest = {
            Bucket: bucket.name,
            Body: Readable.from(this.utilService.bufferToStream(file['buffer'])),
            Key: keyFolder,
            ContentType: 'multipart/form-data',
            Metadata: metadata,
            Tagging: 'key1=value1&key2=value2',
            StorageClass: 'STANDARD',
          };
          this.s3.putObject(putObjReq, (err, data) => {
            if (err) {
              console.log('err creating obj:', err);
              reject(
                AppConfigService.getCustomError(
                  'FID-S3-CUSTOM',
                  `${err.hostname}- ${err.originalError} - code:${err.code}, status: ${err.statusCode}`,
                ),
              );
            } else {
              console.log('data:', data);
              resolve(
                plainToClass(CommonOutputResponse, {
                  message: 'Object created successfully',
                  status: 'Success',
                }),
              );
            }
          });
        } else {
          // the fail safe approach is to intimate the user that bucket is not created
          // and therefore automatically creating one is not recommended
          reject(
            plainToClass(
              CommonOutputResponse,
              {
                timestamp: AppUtilService.defaultISOTime(),
                message: `Object cannot be created since ${bucket.name} doesn't exist`,
                status: 'Failure',
              },
              { excludeExtraneousValues: true },
            ),
          );
        }
      } catch (err) {
        console.log('err: last:', err);
        // This most possibly will be AWS error
        reject(AppConfigService.getCustomError('FID-S3-CUSTOM', `${err.message}-code:${err.code}- status:${err.statusCode}`));
      }
    });
  }

  /**
   * Service to list all buckets
   * @param isInternalCall - determines if the call is from a controller or another method
   */
  async listAllBuckets(isInternalCall: boolean = true): Promise<AWS.S3.Bucket[] | CommonOutputResponse> {
    return new Promise((resolve, reject) => {
      this.s3.listBuckets((err, data) => {
        if (err) {
          reject(err);
        } else {
          console.log('data', data);
          if (isInternalCall) {
            resolve(data.Buckets);
          } else {
            resolve(
              plainToClass(CommonOutputResponse, {
                timestamp: AppUtilService.defaultISOTime(),
                status: 'Success',
                data: {
                  buckets: data.Buckets.map(bucket => bucket.Name).join(','),
                  createdBy: data.Owner.DisplayName,
                },
              }),
            );
          }
        }
      });
    });
  }

  /**
   * This lists all the objects available in the bcuket
   * @param bucketName
   */
  async listBucketObjects(bucketName: string) {
    return new Promise((resolve, reject) => {
      this.s3.listObjectsV2({ Bucket: bucketName }, (err, data) => {
        if (err) {
          reject(err);
        } else {
          console.log('data', data);

          resolve(
            plainToClass(CommonOutputResponse, {
              timestamp: AppUtilService.defaultISOTime(),
              status: 'Success',
              data: {
                buckets: data,
              },
            }),
          );
        }
      });
    });
  }

  async fetchBucketDetail() {
    return new Promise((resolve, reject) => {
      let bucketList = [];
      const bucketStream = this.s3.listBuckets().createReadStream();
      bucketStream.once('readable', () => {
        bucketStream.on('data', chunk => {
          console.log('coming in fr data:', chunk);
          bucketList.push(chunk);
        });
      });
      bucketStream.on('error', err => {
        console.log('err in reading list of bucket');
        reject(AppConfigService.getCustomError('FID-S3-CUSTOM', 'Error retreiving details from S3 bucket:' + err));
      });
      bucketStream.on('end', () => {
        console.log('bucketList fetched:', bucketList);
        resolve(bucketList);
      });
    });
  }

  @VideoFileValidator
  async streamFileUpload(bucket: BucketModel, fileObj: any) {
    const putObjParam = this.getPutPbjParamForS3(bucket, fileObj);
    delete putObjParam.Body; // since we are going to use directly
    return new Promise(async (resolve, reject) => {
      const read = this.utilService.bufferToStream(fileObj['buffer']);
      const compress = zlib.createGzip();
      const upload = this.s3Upload.upload(putObjParam);
      upload.maxPartSize(1024 * 1024 * 6); // 20 MB
      upload.concurrentParts(15);

      upload.on('part', function(details) {
        console.log('still uploading ....', details);
      });

      upload.on('uploaded', function(details) {
        console.log('upload completed', details);
        upload.end();
        resolve(
          plainToClass(CommonOutputResponse, {
            timestamp: AppUtilService.defaultISOTime(),
            status: '200-OK',
            message: 'Uploaded succesfully',
            data: {
              location: details['Location'],
              uploadedTo: details['Bucket'],
              withName: details['Key'] + '' + bucket.fileData.name,
            },
          }),
        );
      });

      upload.on('error', error => {
        console.log('error occured upploading the data:', error);
        upload.end();
        reject(AppConfigService.getCustomError('FID-S3-CUSTOM', 'Error occured:' + error['message']));
      });

      read.pipe(compress).pipe(upload);
    });
  }

  @VideoFileValidator
  async managedUploadFileToFolder(bucket: BucketModel, fileObj: any) {
    return new Promise(async (resolve, reject) => {
      // first make sure that the bucket exists
      try {
        const bucketList = await this.listAllBuckets();
        if (
          !(bucketList instanceof CommonOutputResponse) &&
          bucketList.filter(item => item.Name.toUpperCase() === bucket.name.toUpperCase()).length >= 1
        ) {
          // means there is a bucket and obj can be created
          // create obj params
          const putObjParam = this.getPutPbjParamForS3(bucket, fileObj);
          this.s3MangedUpload = new AWS.S3.ManagedUpload({
            leavePartsOnError: false,
            partSize: 1024 * 1024 * 6,
            queueSize: 16,
            params: putObjParam,
            tags: this.utilService.createTags(false, true),
          });
          this.s3MangedUpload.send((err, uploadData) => {
            console.log('aws err obtained:', err);
            if (err) {
              reject(
                AppConfigService.getCustomError(
                  'FID-S3-CUSTOM',
                  `Error uploading the data:${err.message} - code: ${err.code} - status: ${err.statusCode}`,
                ),
              );
            }
            resolve(
              plainToClass(CommonOutputResponse, {
                timestamp: AppUtilService.defaultISOTime(),
                status: 'Success',
                message: `${fileObj['originalname']} Uploaded successfully with alias ${bucket.fileData.name}`,
                data: {
                  uploadedToHttps: uploadData.Location,
                  uploadedToFolder: `s3://${bucket.name}//${bucket.folder}`,
                },
              }),
            );
          });
          this.s3MangedUpload.on('httpUploadProgress', progress => {
            console.log('progress:', progress);
          });
        } else {
          reject(AppConfigService.getCustomError('FID-S3-CUSTOM', `Object cannot be created since ${bucket.name} doesnt exist`));
        }
      } catch (err) {
        console.log('err:', err);
        reject(AppConfigService.getCustomError('FID-S3-CUSTOM', 'Object cannot be uploaded -' + err.message));
      }
    });
  }

  /**
   * old way of uploading -better to use managed uploads or s3 upload stream as above  - there is an error in getting the data to upload, need to resolve it
   * - always ending up with MALFORMED XML error
   */
  @VideoFileValidator
  async fileUploadAsMultiparts(bucket: BucketModel, fileObj: any) {
    // first create a temp folder and add the file
    try {
      const resultToLocal = await this.streamService.uploadFileToLocal(bucket.fileData, fileObj);
      console.log('retul local upload:', resultToLocal);
      // once done, we can get the file buffer from there
      const mimeType: string = fileObj['mimetype'];
      const fileType = mimeType.substring(mimeType.lastIndexOf(APP_CONSTANTS.CHAR.SLASH) + 1, mimeType.length);
      const filePath = path.join(`${process.cwd()}/upload/${bucket.fileData.name}.${fileType}`);
      console.log('filePath', filePath);
      fs.readFile(filePath, (err, fileData) => {
        //set the partsize
        let partSize = 1024 * 1024 * 5; // minimm 5 Mb needed
        // check the size of the file before upload
        if (fileData && fileData.length > 0) {
          const actualSizeinBytes = fileData.length;
          const metadata: AWS.S3.Metadata = JSON.parse(JSON.stringify(bucket.fileData.metadata));
          const keyFolder =
            bucket && bucket.folder
              ? APP_CONSTANTS.COMMON.APP_NAME +
                '/' +
                bucket.folder +
                '/' +
                bucket.fileData.name +
                APP_CONSTANTS.CHAR.DOT +
                mimeType.substring(mimeType.lastIndexOf(APP_CONSTANTS.CHAR.SLASH) + 1)
              : 'tf-default-video';

          const putObjParam = {
            Bucket: bucket.name,
            Key: keyFolder,
            ContentType: 'multipart/form-data',
            Metadata: metadata,
            Tagging: this.utilService.createTags(false, true),
            StorageClass: 'STANDARD',
            CORSConfiguration: FileUtilService.createCorsConfig(),
          };
          console.log('partSize:', partSize);
          console.log('actualSuze:', actualSizeinBytes, fileData);

          const parts = Math.ceil(actualSizeinBytes / partSize);
          // use multipart upload
          return new Promise((resolve, reject) => {
            this.s3.createMultipartUpload(
              {
                Bucket: putObjParam.Bucket,
                Key: keyFolder,
                ACL: 'public-read-write',
                StorageClass: 'STANDARD',
                Metadata: putObjParam.Metadata,
              },
              (multipartError, multipartOutput) => {
                if (!multipartError) {
                  console.log('initiating timeseries...');
                  async.timesSeries(parts, (partitionNum, nextCb) => {
                    // determine the size of upload
                    const start = partitionNum * partSize;
                    const end = Math.min(start + partSize, actualSizeinBytes);
                    partitionNum++; // ready for the next iteration
                    // retries thrice for every multipart failure
                    async.retry(
                      3,
                      retryCb => {
                        const uploadPartReq: AWS.S3.UploadPartRequest = {
                          PartNumber: partitionNum,
                          Body: fileData.slice(start, end),
                          Bucket: putObjParam.Bucket,
                          UploadId: multipartOutput.UploadId,
                          Key: putObjParam.Key,
                        };
                        this.s3.uploadPart(uploadPartReq, (partErr, uploadPartOutput) => {
                          // incase of error
                          retryCb(partErr, uploadPartOutput);
                        });
                      },
                      (err, dataParts) => {
                        console.log('initiating complete upload', dataParts);
                        // once successfull complete the upload
                        const completeUploadReq: AWS.S3.CompleteMultipartUploadRequest = {
                          MultipartUpload: {
                            Parts: [dataParts],
                          },
                          Bucket: putObjParam.Bucket,
                          Key: putObjParam.Key,
                          UploadId: multipartOutput.UploadId,
                        };
                        this.s3.completeMultipartUpload(completeUploadReq, (err, completedData) => {
                          if (err) {
                            console.log('err when completion of upliad', err);
                            reject(
                              AppConfigService.getCustomError(
                                'FID-S3-CUSTOM',
                                `
                                            Error in completion of multipart req with partition - ${multipartOutput.UploadId}: message:${err.message} -
                                            code: ${err.code} -
                                            status: ${err.statusCode} 
                                            `,
                              ),
                            );
                          } else {
                            // success
                            console.log('completed multipart upload');
                            resolve(
                              plainToClass(CommonOutputResponse, {
                                timestamp: AppUtilService.defaultISOTime(),
                                status: 'Success',
                                data: {
                                  bucket: completedData.Bucket,
                                  location: completedData.Location,
                                  version: completedData.VersionId,
                                },
                              }),
                            );
                          }
                        });
                      },
                    );
                  });
                } else {
                  console.log('err :', multipartError);
                  // There is error in upload, so throw the err
                  reject(
                    AppConfigService.getCustomError(
                      'FID-S3-CUSTOM',
                      `Error while upload file: error - ${multipartError.message} - code:${multipartError.code}
                                    status:${multipartError.statusCode}`,
                    ),
                  );
                }
              },
            );
          });
        }
      });
    } catch (err) {
      throw AppConfigService.getCustomError('FID-S3-CUSTOM', 'Temp file cannot be created' + err.message);
    }
  }

  /**
   * This is to download the file stream
   * @param fileNames
   */
  async streamFilesDownload(fileNames: string[]) {
    const downloadPath: string = path.join(process.cwd(), 'download');
    // download the files as zip
    fileNames = ['10mb.mp4', '50mb.mp4'];
    return FileUtilService.createZip(path.join(process.cwd(), 'upload'));
  }

  /**
   * This service downloads a single file
   * @param bucket
   * @param resp
   */
  async streamSingleFileDownload(bucket: BucketModel, resp: FastifyReply) {
    return new Promise((resolve, reject) => {
      // first listObjects
      console.log('Finding concerned obj...');
      this.s3.listObjectsV2({ Bucket: bucket.name }, (err, listObjOutput) => {
        if (err) {
          console.log('Err in finding the obj', err);
          reject(AppConfigService.getCustomError('FID-S3-CUSTOM', `Bucket cannot be scrapped to find the object due to - ${err.message}`));
        } else {
          console.log('Object/file found:', listObjOutput);
          if (
            listObjOutput.Name.toUpperCase() === bucket.name.toUpperCase() &&
            listObjOutput.KeyCount >= 1 &&
            listObjOutput.Contents.filter(content => content.Key.includes(bucket.fileData.name)).length != 0
          ) {
            // means the file being searched is there as S3 Object
            console.log('found the file being searched');
            const s3FileStream = this.s3
              .getObject({
                Bucket: bucket.name,
                Key: listObjOutput.Contents[0].Key,
              })
              .createReadStream();
            resp.headers({
              'Content-disposition': `attachment; filename=${bucket.fileData.name}.mp4`,
              'Content-type': 'video/mp4',
            });

            // NOt sure how to pump the readstream to response, for now sending it directly
            // pump(s3FileStream, resp.raw, (err) => {
            //              console.log('err in getting data:', err);
            //              reject(AppConfigService.getCustomError('FID-S3-CUSTOM', `File cannot be download - ${err.message}`));
            // });
            // TODO: this takes a very long time for larger files - need to find an alternate method
            resp.send(s3FileStream);
          } else {
            resolve(
              plainToClass(CommonOutputResponse, {
                timestamp: AppUtilService.defaultISOTime(),
                status: 'Failure',
                message: 'No objects found in this bucket',
              }),
            );
          }
        }
      });
    });
  }

  /**
   *
   * @param bucket
   * @param resp
   */
  async streamMultipleFileDownload(bucket: BucketModel) {
    return new Promise((resolve, reject) => {
      // first listObjects
      console.log('Finding concerned obj...');
      this.s3.listObjectsV2({ Bucket: bucket.name }, (err, listObjOutput) => {
        if (err) {
          console.log('Err in finding the obj', err);
          reject(AppConfigService.getCustomError('FID-S3-CUSTOM', `Bucket cannot be scrapped to find the object due to - ${err.message}`));
        } else {
          console.log('Object/file found:', listObjOutput);
          // first download all objects to local temp folder - say download
          if (listObjOutput && listObjOutput.Contents) {
            const downloadPath: string = path.join(process.cwd(), '/download');
            let fileWriteStream: fs.WriteStream = null;
            let s3Stream = null;
            listObjOutput.Contents.forEach(content => {
              const fileToDownload = content.Key.substr(content.Key.lastIndexOf('/') + 1, content.Key.length);
              fileWriteStream = fs.createWriteStream(path.join(downloadPath, `${fileToDownload}`));
              s3Stream = this.s3.getObject({ Bucket: bucket.name, Key: content.Key }).createReadStream();
              s3Stream.on('error', err => {
                console.log('error in download:', err);
                reject(AppConfigService.getCustomError('FID-S3-CUSTOM', 'Error in downloading:' + err.message));
              });
              s3Stream.on('finish', () => {
                console.log('finish event fired');
              });
              s3Stream.on('close', () => {
                console.log('close event fired:');
                resolve(FileUtilService.createZip(downloadPath));
              });
              // s3Stream.pipe(fileWriteStream);
              pump(s3Stream, fileWriteStream);
            });
            // then archive and send it
          } else {
            // means there is no object found in the bucket
            resolve(
              plainToClass(CommonOutputResponse, {
                timestamp: AppUtilService.defaultISOTime(),
                status: 'Failure',
                message: 'No objects found in this bucket',
              }),
            );
          }
        }
      });
    });
  }

  /**
   * TODO: create CORS config
   * @private
   */
  private createBucketCors() {}

  /**
   * This method is for setting the putObjParam
   * @param bucket
   * @param fileObj
   * @private
   */

  private getPutPbjParamForS3(bucket: BucketModel, fileObj: any) {
    const mimeType = fileObj['mimetype'];

    const metadata: AWS.S3.Metadata = JSON.parse(JSON.stringify(bucket.fileData.metadata));
    const keyFolder =
      bucket && bucket.folder
        ? APP_CONSTANTS.COMMON.APP_NAME +
          '/' +
          bucket.folder +
          '/' +
          bucket.fileData.name +
          APP_CONSTANTS.CHAR.DOT +
          mimeType.substring(mimeType.lastIndexOf(APP_CONSTANTS.CHAR.SLASH) + 1)
        : 'tf-default-video';

    const putObjParam: AWS.S3.PutObjectRequest = {
      Body: Readable.from(this.utilService.bufferToStream(fileObj['buffer'])).pipe(zlib.createGzip()),
      Bucket: bucket.name,
      Key: keyFolder,
      ContentType: 'multipart/form-data',
      Metadata: metadata,
      StorageClass: 'STANDARD',
    };
    return putObjParam;
  }
}
