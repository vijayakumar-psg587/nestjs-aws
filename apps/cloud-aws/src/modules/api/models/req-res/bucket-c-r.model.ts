import {Expose, Type} from "class-transformer";
import {BucketAclEnum} from "../enums/bucket-acl.enum";
import {IsEnum, IsNotEmpty, IsString} from "class-validator";

export class BucketCRModel {

    @Expose({name:  'Bucket'})
    @IsNotEmpty()
    @IsString()
    name: string;

    @Expose({name: 'ACL'})
    acl?: BucketAclEnum;

}
