import {AwsHealthCheckColorEnum} from "./aws-health-check-color.enum";

export class AWSHealthCheckModel {
    indicativeColor: AwsHealthCheckColorEnum;
    message: string;

    constructor(color: AwsHealthCheckColorEnum, msg: string) {
        this.indicativeColor = color;
        this.message = msg;
    }
}
