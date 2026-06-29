import { OptionType, OptionUnit } from "../../price-requests/interfaces/price-request-element-option.interface";
import { PurchaseOrderElement } from "./purchase-order-element.interface";

export interface PurchaseOrderElementOption {
    id?: number;
    type?: OptionType;
    denomination?: string;
    quantity?: number;
    price?: number;
    unit?: OptionUnit;
    purchaseOrderElementId?: number;
    purchaseOrderElement?: PurchaseOrderElement;
}

export interface PurchaseOrderElementOptionInput {
    type?: OptionType;
    denomination?: string;
    quantity?: number;
    price?: number;
    unit?: OptionUnit;
    purchaseOrderElementId?: number;
}

export interface PurchaseOrderElementOptionInpdate extends PurchaseOrderElementOptionInput {
    id?: number;
}