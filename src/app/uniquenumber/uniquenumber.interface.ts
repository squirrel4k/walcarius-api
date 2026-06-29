export enum NUMBER_TYPE {
    QUOTE,
    PRICE_REQUEST,
    PURCHASE_ORDER
}

export enum WILDCARD_TYPE {
    MONGO = ".",
    MYSQL = "_"
}

export interface UniqueNumberConfiguration {
    format: string;
    fieldName: string;
    yearlyRAZ: boolean;
    monthlyRAZ: boolean;
    wildcard: WILDCARD_TYPE;
}