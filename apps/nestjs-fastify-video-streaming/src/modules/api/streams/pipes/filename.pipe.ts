import { ArgumentMetadata, Injectable, PipeTransform } from '@nestjs/common';
import { APP_CONSTANTS } from '../../../shared/utils/app.constants';
import { AppConfigService } from '../../../shared/services/app-config/app-config.service';
import { FileValidationPipe } from './file-validation.pipe';
import { isInstance } from 'class-validator';

@Injectable()
export class FilenamePipe<T> implements PipeTransform {
  private passThroughPipe?;
  constructor(passPipe: T = null) {
    this.passThroughPipe = passPipe;
  }
  transform(value: any, metadata: ArgumentMetadata) {
    if (!this.passThroughPipe) {
      if (value != null && APP_CONSTANTS.REGEX.FILE_NAME.test(value)) {
        return value;
      } else {
        throw AppConfigService.getCustomError('FID-REQ', `Invalid query param passed name - ${value}`);
      }
    } else {
      // means we have to call the other pipe and see if the file exists
      if (metadata.type && metadata.type === 'param' && isInstance(this.passThroughPipe, FileValidationPipe)) {
        // call the other pipe transform and that takes care of the return
        return this.passThroughPipe.transform(value, metadata);
      } else {
        throw AppConfigService.getCustomError(
          'FID-CUSTOM',
          `Pipe created is incorrect. Please have FileValidationPipe added as pasthrough. Current passthroughpipe is invalid - ${typeof this
            .passThroughPipe}`,
        );
      }
    }
  }
}
