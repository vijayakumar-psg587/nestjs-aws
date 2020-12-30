import { Module } from '@nestjs/common';
import { AwsS3Controller } from './controllers/aws-s3/aws-s3.controller';
import { S3Service } from './services/s3/s3.service';
import { FileStreamService } from './services/file-stream/file-stream.service';
import { SharedModule } from '../../shared/shared.module';
import { FileUtilService } from './services/file-util/file-util.service';
import { StreamController } from './controllers/stream/stream.controller';

@Module({
  controllers: [AwsS3Controller, StreamController],
  providers: [S3Service, FileStreamService, FileUtilService],
  exports: [FileStreamService, S3Service],
  imports: [SharedModule],
})
export class StreamsModule {}
