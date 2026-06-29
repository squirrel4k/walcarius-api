import { UniqueNumberConfiguration, NUMBER_TYPE, WILDCARD_TYPE } from "./uniquenumber.interface";

export const NUMBER_CONFIG: { [numberType: number]: UniqueNumberConfiguration } = {
    [NUMBER_TYPE.QUOTE]: {
        format: "YYYYxxxx",
        fieldName: "number",
        yearlyRAZ: true,
        monthlyRAZ: false,
        wildcard: WILDCARD_TYPE.MONGO,
    },
    [NUMBER_TYPE.PRICE_REQUEST]: {
        format: "DPYYYY-xxxx",
        fieldName: "reference",
        yearlyRAZ: true,
        monthlyRAZ: false,
        wildcard: WILDCARD_TYPE.MYSQL,
    },
    [NUMBER_TYPE.PURCHASE_ORDER]: {
        format: "BCYYYY-xxxx",
        fieldName: "reference",
        yearlyRAZ: true,
        monthlyRAZ: false,
        wildcard: WILDCARD_TYPE.MYSQL,
    }
};