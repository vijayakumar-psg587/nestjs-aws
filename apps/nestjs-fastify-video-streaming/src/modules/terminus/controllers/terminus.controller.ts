import {Controller, Get} from '@nestjs/common';
import {TerminusService} from "../services/terminus/terminus.service";
import {ApiTags} from "@nestjs/swagger";

@Controller('health-check')
@ApiTags('Terminus')
export class TerminusController {
    constructor(private readonly terminusService: TerminusService) {
    }

    @Get('/service')
    public async terminusServiceCheck(): Promise<any> {
        return await this.terminusService.checkServiceAccess();
    }

}
