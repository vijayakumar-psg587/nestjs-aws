import { Module } from '@nestjs/common';
import { S3Controller } from './controllers/s3/s3.controller';
import { S3Service } from './services/s3/s3.service';
import { AWSUtilService } from './utils/aws-util/aws-util.service';

@Module({
  controllers: [S3Controller],
  providers: [S3Service, AWSUtilService]
})
export class ApiModule {}
