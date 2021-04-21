import { HttpStatus, Injectable, Scope } from '@nestjs/common';
import { AppConfigModel } from '../../models/app-config.model';
import { SwaggerModel } from '../../models/swagger-model';
import { SwaggerModelBuilder } from '../../models/builder/swagger-model.builder';
import { CustomErrorModel } from '../../models/error/custom-error.model';
import { AppUtilService } from '../app-util/app-util.service';
import { APP_CONSTANTS } from '../../utils/app.constants';
import * as os from 'os';
import { ValidationError } from 'class-validator';

@Injectable({
  scope: Scope.DEFAULT,
})
export class AppConfigService {
  static configModel: AppConfigModel;
  static swaggerModel: SwaggerModel;

  constructor() {}

  static getAppCommonConfig(): AppConfigModel {

    if (!this.configModel) {
      this.configModel = new AppConfigModel();
      if (process.env.APP_BODY_LIMIT) {
        this.configModel.body_limit = parseInt(process.env.APP_BODY_LIMIT);
      }
      this.configModel.port = +process.env.AWS_APP_PORT;
      this.configModel.host = process.env.AWS_APP_HOST;
      this.configModel.version = process.env.AWS_APP_VERSION;
      this.configModel.context_path = process.env.AWS_APP_CONTEXT_PATH;
      this.configModel.node_env = process.env.NODE_ENV;
      this.configModel.service_retry_count = +process.env.AWS_APP_SERVICE_RETRY_COUNT;
      this.configModel.isEnableProxy = process.env.AWS_ENABLE_HTTPS_PROXY !== 'false';
    }
    return this.configModel;
  }

  static getSwaggerModel(): SwaggerModel {
    if (!this.swaggerModel) {
      const swaggerModelBuilder = new SwaggerModelBuilder();
      this.swaggerModel = swaggerModelBuilder
        .setContext(process.env.APP_CONTEXT_PATH)
        .setEmail(process.env.APP_SWAGGER_EMAIL)
        .setServer(process.env.APP_SWAGGER_SERVER_URL)
        .setUrl(process.env.APP_SWAGGER_ENDPOINT)
        .setTitle(process.env.APP_SWAGGER_TITLE)
        .setDescription(process.env.APP_SWAGGER_DESC)
        .build();
    }
    return this.swaggerModel;
  }

  static getCustomError(code: string, message: string) {
    const customError = new CustomErrorModel();
    customError.code = code;
    if (code && (code.includes('CORS') || code.includes('DB') || code.includes('REQ') || code.includes('CUSTOM'))) {
      customError.status = 500;
    } else if (code && (code.includes('HEADER') || code.includes('VALIDATION'))) {
      customError.status = 400;
    }
    customError.message = message;
    customError.timestamp = AppUtilService.defaultISOTime();
    return customError;
  }

  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  static validationExceptionFactory(errors: ValidationError[]) {
    const customError = new CustomErrorModel();
    customError.code = '400';
    customError.timestamp = AppUtilService.defaultISOTime();

    customError.status = HttpStatus.BAD_REQUEST;
    let errMessage = '';
    errors.forEach(err => {
      console.log('witnessing err tartgetm and err val', err.target?.constructor?.name, err.value);
      errMessage =
        errMessage === ''
          ? AppConfigService.getValidationErrorMessage(err)
          : errMessage.concat(APP_CONSTANTS.CHAR.HYPHEN).concat(AppConfigService.getValidationErrorMessage(err));
    });

    console.log('final Error message:', errMessage);
    customError.message = errMessage;
    throw customError;
  }

  static getValidationErrorMessage(err: ValidationError): string {
    return (
      `Validation err for - ${err.target?.constructor?.name} with property - ${err.property} -value - ${err.value} 
    has the constraints - ${JSON.stringify(err.constraints)}` + os.EOL
    );
  }
}
