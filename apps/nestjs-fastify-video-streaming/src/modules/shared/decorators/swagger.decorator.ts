import {
  ApiBadRequestResponse,
  ApiHeaders,
  ApiInternalServerErrorResponse,
  ApiOperation,
  ApiOperationOptions,
  ApiResponse,
  ApiResponseOptions,
} from '@nestjs/swagger';
import { APP_CONSTANTS } from '../utils/app.constants';

export const SwaggerDec = (
  operations: ApiOperationOptions,
  responses: ApiResponseOptions[] = [],
): ((target: any, key: string, descriptor?: PropertyDescriptor) => void) => {
  return (target, key, descriptor) => {
    ApiOperation(operations)(target, key, descriptor);
    // @ts-ignore
    ApiHeaders([...Object.values(APP_CONSTANTS.HEADERS)])(target, key, descriptor);
    ApiInternalServerErrorResponse({
      description: 'Server error calling the request',
    })(target, key, descriptor);
    ApiBadRequestResponse({
      description: 'Request is invalid please validate',
    })(target, key, descriptor);
    for (const res of responses) {
      ApiResponse(res)(target, key, descriptor);
    }
  };
};
