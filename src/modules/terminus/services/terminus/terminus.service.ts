import {HttpService, Injectable, Scope} from '@nestjs/common';
import {APP_CONSTANTS} from "../../../shared/utils/app.constants";
import {HealthCheckModel} from "../../models/health-check.model";
import {HealthCheckColorEnum} from "../../models/enum/health-check-color.enum";
import {RetryService} from "../../../shared/services/retry/retry.service";
import {BehaviorSubject} from "rxjs";

@Injectable({
    scope: Scope.DEFAULT
})
export class TerminusService {
    calljsonPlaceHolderSub: BehaviorSubject<any>;

    constructor(private readonly httpService: HttpService) {
        this.calljsonPlaceHolderSub = new BehaviorSubject<any>('');
    }

    async checkServiceAccess(): Promise<HealthCheckModel> {
        return new Promise(async (resolve, reject) => {
            try {
                // const axiosConfig = await AppConfigService.configureAxios(APP_CONSTANTS.HEALTH_CHECK.URL, HttpMethodsEnum.GET, '',
                // );
                // const response = await axios(axiosConfig);
                const serviceObs$ = this.httpService.get(APP_CONSTANTS.HEALTH_CHECK.URL);
                serviceObs$.subscribe(data => {
                    console.log('sucessfully accessed the data:', data.data);
                    resolve(new HealthCheckModel(HealthCheckColorEnum.GREEN, 'Success'));
                }, error => {
                    console.log('err accessing the data', error.message);
                    RetryService.retryOnError(serviceObs$, true).subscribe(respData => {
                        console.log('service - resp:', respData);
                        if (respData.status === 200) {
                            resolve(new HealthCheckModel(HealthCheckColorEnum.GREEN, 'Success'))
                        } else {
                            reject(new HealthCheckModel(HealthCheckColorEnum.RED, 'Error in accessing services - perhaps check the proxy'))
                        }
                    }, err => {
                        console.log('err in terminus service:', err);
                        reject(new HealthCheckModel(HealthCheckColorEnum.RED, 'Error in accessing services - perhaps check the proxy'));

                    })
                })

                // if (response.status != 200) {
                //     // then retry the service
                //     RetryService.retryOnError(of(await axios(axiosConfig))).subscribe(respData => {
                //         if (respData.status === 200) {
                //             resolve(new HealthCheckModel(HealthCheckColorEnum.GREEN, 'Success'))
                //         } else {
                //             resolve(new HealthCheckModel(HealthCheckColorEnum.ORANGE, 'Error in accessing services - perhaps check the proxy'))
                //         }
                //     });
                // } else {
                //     resolve(new HealthCheckModel(HealthCheckColorEnum.GREEN, 'Success'));
                // }
            } catch (err) {
                //Todo: create logging service and send it there
                console.log('err accessing service:', err);
                reject(new HealthCheckModel(HealthCheckColorEnum.RED, 'Cannot access the intranet/internet'));

            }
        });


    }

    // async checkDatabaseAccess() {
    //
    // }
}
