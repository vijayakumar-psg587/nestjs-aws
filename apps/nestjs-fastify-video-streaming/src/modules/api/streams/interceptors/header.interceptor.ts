import { CallHandler, ExecutionContext, Injectable, NestInterceptor, Scope } from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import * as fastify from 'fastify';
import { APP_CONSTANTS } from '../../../shared/utils/app.constants';
import { AppConfigService } from '../../../shared/services/app-config/app-config.service';
import validator from 'validator';
import { UserIdType } from '../../../shared/models/enums/headers/user-id-type.enum';
import { PrincipalRoleType } from '../../../shared/models/enums/headers/principal-role-type.enum';
import { Readable } from 'stream';

@Injectable({
  scope: Scope.REQUEST,
})
export class HeaderInterceptor implements NestInterceptor {
  async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
    const req: fastify.FastifyRequest = context.switchToHttp().getRequest();

    //generator - convert header to map
    try {
      const headerMap: Map<String, String> = await this.convertHeaderToMap(req);
      let mHeaderList = [];
      for (const [key, val] of headerMap.entries()) {
        if (APP_CONSTANTS.MANDATORY_HEADERS_NAME_LIST.includes(key.toUpperCase())) {
          mHeaderList.push([key, val]);
        }
      }
      if (mHeaderList.length > 0 && mHeaderList.length === APP_CONSTANTS.MANDATORY_HEADERS_NAME_LIST.length) {
        // it means that we have all the mandatory headers
        // now check the values
        this.validateHeaders(mHeaderList, req);
      } else {
        return throwError(AppConfigService.getCustomError('FID-HEADER', 'Required headers are missing'));
      }
    } catch (err) {
      console.log(err);
      throw err;
    }
    return next.handle();
  }

  /**
   * This is a simple implementation to use async generators - Definitely its an overkill here
   * THis sample implementation can be used elsewhere
   * @param request
   * @private
   */
  private static async *headerGenerator(request: fastify.FastifyRequest) {
    for await (const item of Object.keys(request.headers)) {
      yield [item, request.headers[item]];
    }
  }

  /**
   * THis is a proper way to implement async generators with streams
   * When reading the stream via genenrator generated values, make sure to collect cevery chunk
   * and only on end, chunk should be used
   *
   * !!! Pointer - suppose in case of video/audio/large files to be zipped - generate the chunks via headerGenerator
   * accumulate them and pass it on to processors in goland or python
   * @param request
   * @private
   */
  private async convertHeaderToMap(request: fastify.FastifyRequest): Promise<Map<String, String>> {
    return new Promise(async (resolve, reject) => {
      let headerMap = new Map();
      const headerMapStream = await Readable.from(HeaderInterceptor.headerGenerator(request));
      headerMapStream.once('readable', () => {
        headerMapStream.on('data', chunk => {
          headerMap.set(chunk[0], chunk[1]);
        });
      });

      headerMapStream.on('error', () => {
        // log that the request cannot be read and throw error message
        console.log('Error in reading the request headers. Please restart the instance/flow');
        headerMapStream.emit('close'); // required to close the stream
        reject(AppConfigService.getCustomError('FID-HEADER', 'Invalid request/Request cannot be read'));
      });

      headerMapStream.on('end', () => {
        resolve(headerMap);
      });
    });
  }

  private validateHeaders(headerList: string[], req: fastify.FastifyRequest) {
    let errMessage = '';
    let headerVal = '';
    headerList.forEach(item => {
      headerVal = req.headers[item] as string;
      if (item.includes('TRACKING'.toLowerCase()) && !validator.isUUID(headerVal, '4')) {
        // then throw err
        errMessage = errMessage + `Header - ${item} of val ${headerVal} is not a valid uuid \n`;
      } else if (item.includes('USER-TYPE'.toLowerCase()) && !UserIdType[headerVal]) {
        errMessage =
          errMessage +
          `Header - ${item} of val ${headerVal} is not a valid UserIdType.
                        ValidHeaders are ${Object.keys(UserIdType)} \n`;
      } else if (item.includes('PRINCIPAL'.toLowerCase()) && !PrincipalRoleType[headerVal]) {
        errMessage =
          errMessage +
          `Header - ${item} of val ${headerVal} is not a valid PrincipalRoleType.
                        ValidHeaders are ${Object.keys(PrincipalRoleType)} \n`;
      } else if (item.includes('PROCESS'.toLowerCase()) && !validator.isUUID(headerVal.substr(3, headerVal.length - 1), '4')) {
        errMessage = errMessage + `Header - ${item} of val ${headerVal} doesn't contain a valid UUID \n`;
      }
    });

    if (errMessage != null && errMessage.length > 0) {
      throw AppConfigService.getCustomError('FID-HEADER', errMessage);
    }
  }
}
