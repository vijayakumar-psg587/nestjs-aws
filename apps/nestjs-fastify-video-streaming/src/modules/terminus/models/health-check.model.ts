import {HealthCheckColorEnum} from "./enum/health-check-color.enum";

export class HealthCheckModel {
    indicativeColor: HealthCheckColorEnum;
    message: string;

    constructor(color: HealthCheckColorEnum, msg: string) {
        this.indicativeColor = color;
        this.message = msg;
    }
}