export interface IPermission {
    id?: number;
    userGroup?: string;
    category?: string;
    read?: boolean;
    write?: boolean;
    delete?: boolean;
    seePrices?:boolean;
}

export class UpdatePermission{
    userGroup?: string;
    category?: string;
    read?: boolean;
    write?: boolean;
    delete?: boolean;
    seePrices?:boolean;
}