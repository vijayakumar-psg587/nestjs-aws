import {Expose} from "class-transformer";

export class OwnerMetadataModel {
    @Expose({name: 'DisplayName'})
    ownerName: string;

    @Expose({name: 'ID'})
    ownerID: string;
}
