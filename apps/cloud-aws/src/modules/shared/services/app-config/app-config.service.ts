import { Injectable } from '@nestjs/common';
import { AwsAppConfigModel } from '../../models/aws-app-config.model';

@Injectable()
export class AppConfigService {
  static appConfigModel: AwsAppConfigModel;
  constructor() {}

  static getAppConfig(): AwsAppConfigModel {
    if (!AppConfigService.appConfigModel) {
      AppConfigService.appConfigModel = new AwsAppConfigModel();
      AppConfigService.appConfigModel.contextPath = process.env.AWS_APP_CONTEXT_PATH;
      AppConfigService.appConfigModel.retries = +process.env.HTTP_RETRIES;
      AppConfigService.appConfigModel.port = +process.env.AWS_APP_PORT;
      AppConfigService.appConfigModel.host = process.env.AWS_APP_HOST;
      AppConfigService.appConfigModel.appVersion = process.env.AWS_APP_VERSION;
      AppConfigService.appConfigModel.timeout = +process.env.HTTP_TIMEOUT;
      AppConfigService.appConfigModel.maxRedirects = +process.env.HTTP_MAX_REDIRECTS;
    }
    return AppConfigService.appConfigModel;
  }
}
