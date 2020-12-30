import { ArgumentMetadata, Injectable, PipeTransform, Scope } from '@nestjs/common';
import { AppConfigService } from '../../../shared/services/app-config/app-config.service';
import { APP_CONSTANTS } from '../../../shared/utils/app.constants';

@Injectable({
  scope: Scope.REQUEST,
})
export class IdValidationPipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata) {
    console.log('pipe :', value, metadata.metatype.toString());
    if (value) {
      if (APP_CONSTANTS.REGEX.NUMBER.test(value)) {
        return +value;
      } else {
        throw AppConfigService.getCustomError('FID-REQ', `Invalid fileId being passed - ${value} is invalid`);
      }
    } else {
      return;
    }
  }
}
