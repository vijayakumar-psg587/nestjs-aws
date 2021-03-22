import { Injectable } from '@nestjs/common';
import { iif, Observable, of, throwError } from 'rxjs';
import { concatMap, delay, retryWhen, tap } from 'rxjs/operators';
import { AppConfigModel } from '../../models/app-config.model';
import { AppConfigService } from '../app-config/app-config.service';

@Injectable()
export class RetryService {
  private static appConfig: AppConfigModel;

  constructor() {
    RetryService.appConfig = AppConfigService.getAppCommonConfig();
  }

  static retryOnError(source$: Observable<any>, isAxiosReq: boolean = false): Observable<any> {
    return source$.pipe(
      tap(sourceData => {
        console.log('sourceData coming in:', sourceData);
      }),
      retryWhen(errObs$ => {
        return errObs$.pipe(
          tap(errData => console.log('tapping err data:', errData.message)),
          concatMap((errData, itr) => {
            return iif(
              () => itr < RetryService.appConfig.service_retry_count,
              of(source$).pipe(
                tap(data => {
                  console.log('sournce data retry:', source$);
                  itr = itr + 1;
                }),
                delay(itr * this.appConfig.service_retry_count * 1000),
              ),
              throwError(AppConfigService.getCustomError(RetryService.determineErrorCode(isAxiosReq), 'err -' + errData.message)),
            );
          }),
        );
      }),
    );
  }

  private static determineErrorCode(isAxiosReq: boolean): string {
    return isAxiosReq ? 'FID-REQ' : 'FID-CUSTOM';
  }
}
