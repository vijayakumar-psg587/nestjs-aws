import {Expose, Transform, Type} from "class-transformer";
import {format} from "date-fns";
import {API_AWS_CONST} from "../../core/util/api-aws.constants";

export class S3BucketMetadataModel {
    @Expose({name:'CreationDate' , toClassOnly: true})
    @Type(() => Date)
    @Transform(value => format(value, API_AWS_CONST.COMMON.DEFAULT_DATE_TIME_FORMAT))
    CreationDate: string;

    @Expose({name: 'Name', toClassOnly: true})
    Name: string;

}
