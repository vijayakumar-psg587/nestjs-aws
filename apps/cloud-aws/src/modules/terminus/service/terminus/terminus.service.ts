import {HttpService, Injectable} from '@nestjs/common';
import {API_AWS_CONST} from "../../../core/util/api-aws.constants";
import {AWSHealthCheckModel} from "../../model/aws-health-check.model";
import {AwsHealthCheckColorEnum} from "../../model/aws-health-check-color.enum";

@Injectable()
export class TerminusService {
    constructor(private readonly httpService: HttpService) {
    }

    public async isExternallyAccessible() {
        return new Promise(async (resolve, reject) => {
            try {
                // const axiosConfig = await AppConfigService.configureAxios(APP_CONSTANTS.HEALTH_CHECK.URL, HttpMethodsEnum.GET, '',
                // );
                // const response = await axios(axiosConfig);
                const serviceObs$ = this.httpService.get(API_AWS_CONST.HEALTH_CHECK.URL);
                serviceObs$.subscribe(data => {
                    console.log('sucessfully accessed the data:', data.data);
                    resolve(new AWSHealthCheckModel(AwsHealthCheckColorEnum.GREEN, 'Success'));
                }, error => {
                    console.log('err accessing the data', error.message);
                    // RetryService.retryOnError(serviceObs$, true).subscribe(respData => {
                    //     console.log('service - resp:', respData);
                    //     if (respData.status === 200) {
                    //         resolve(new AWSHealthCheckModel(AwsHealthCheckColorEnum.GREEN, 'Success'))
                    //     } else {
                    //         reject(new AWSHealthCheckModel(AwsHealthCheckColorEnum.RED, 'Error in accessing services - perhaps check the proxy'))
                    //     }
                    // }, err => {
                    //     console.log('err in terminus service:', err);
                    //     reject(new AWSHealthCheckModel(AwsHealthCheckColorEnum.RED, 'Error in accessing services - perhaps check the proxy'));
                    //
                    // })
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
                reject(new AWSHealthCheckModel(AwsHealthCheckColorEnum.RED, 'Cannot access the intranet/internet'));

            }
        });

    }
}
