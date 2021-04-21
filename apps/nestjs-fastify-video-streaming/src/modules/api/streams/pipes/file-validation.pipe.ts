import { ArgumentMetadata, Injectable, PipeTransform } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { AppConfigService } from '../../../shared/services/app-config/app-config.service';
@Injectable()
export class FileValidationPipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata) {
    // check if the file name passed exists in download folder -
    const filePath = path.join(process.cwd(), `upload/${value}.mp4`);
    if (fs.existsSync(filePath)) {
      // means file is there
      return value;
    } else {
      throw AppConfigService.getCustomError('FID-REQ', `File - ${value} doesn't exist or its yet to be uploaded`);
    }
  }
}
