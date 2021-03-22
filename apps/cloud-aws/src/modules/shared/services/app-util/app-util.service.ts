import { Injectable, Scope } from '@nestjs/common';
import * as dateFns from 'date-fns';
import * as locale from 'date-fns/locale';
import { API_AWS_CONST } from '../../../core/util/api-aws.constants';
import { UserIdType } from '../../models/enums/user-type.enum';
import { PrincipalRoleType } from '../../models/enums/principal-role.enum';
import { ErrorTypes } from '../../models/enums/error/error-types.enum';
import { CustomErrorModel } from '../../models/exception/custom-error.model';
@Injectable({
  scope: Scope.DEFAULT,
})
export class AppUtilService {
  constructor() {}

  static getDefaultUTCTime() {
    return dateFns.format(Date.now(), API_AWS_CONST.COMMON.DEFAULT_DATE_TIME_FORMAT, { locale: locale.enIN });
  }

  /**
   * This varies for each request, hence setting it via a method
   * @param trackingId
   * @param userID
   * @param principalRole
   */
  static setAxiosRequestHeaders(trackingId: string, userID: UserIdType, principalRole: PrincipalRoleType) {
    return {
      'FID-APP-NAME': API_AWS_CONST.COMMON.APP_NAME,
      'FID-LOG-TRACKING-ID': trackingId,
      'FID-USER-TYPE': userID,
      'FID-CONSUMER-APP-PROCESS': 'PM' + trackingId,
      'FID-PRINCIPAL-ROLE': principalRole,
    };
  }

  static handleCustomException(errorCode: number, type: ErrorTypes, customMsg: string | object) {
    const customErr = new CustomErrorModel();
    if (type === ErrorTypes.VALDIATION) {
      customErr.code = ErrorTypes.VALDIATION;
      customErr.status = 421;
    } else if (type === ErrorTypes.REQ) {
      customErr.code = ErrorTypes.REQ;
      customErr.status = 424;
    } else if (type === ErrorTypes.DB) {
      customErr.code = ErrorTypes.DB;
      customErr.status = 425;
    } else {
      customErr.code = ErrorTypes.CUSTOM;
      customErr.status = 500;
    }

    customErr.message = customMsg;
    customErr.timestamp = AppUtilService.getDefaultUTCTime();
    return customErr;
  }
}
