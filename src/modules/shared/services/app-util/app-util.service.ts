import { Injectable } from '@nestjs/common';
import { APP_CONSTANTS } from '../../utils/app.constants';
import * as dateFns from 'date-fns';

@Injectable()
export class AppUtilService {
  constructor() {}

  static checkForDev(str: string) {
    return str === process?.env?.NODE_ENV ? str === APP_CONSTANTS.COMMON.APP_ENV_DEV : false;
  }

  static defaultISOTime() {
    return dateFns.format(Date.now(), APP_CONSTANTS.COMMON.DEFAULT_DNS_FORMAT);
  }
}
