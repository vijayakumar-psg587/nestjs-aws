import { ArgumentMetadata, Injectable, PipeTransform } from '@nestjs/common';
import { FilenamePipe } from './filename.pipe';
import { AppConfigService } from '../../../shared/services/app-config/app-config.service';

@Injectable()
export class FilenameArrayPipe<T> implements PipeTransform<T> {
  private readonly passThroughPipe;

  constructor(pipeToCall: T) {
    this.passThroughPipe = pipeToCall;
  }

  transform(value: any, metadata: ArgumentMetadata) {
    console.log('metdata here:', metadata);
    if (metadata.type === 'param' && value != undefined && this.passThroughPipe instanceof FilenamePipe) {
      return value.split(',').map(item => this.passThroughPipe.transform(item, metadata));
    } else {
      throw AppConfigService.getCustomError('FID-REQ', `Please pass filenames as an array seperated by comma`);
    }
  }
}
