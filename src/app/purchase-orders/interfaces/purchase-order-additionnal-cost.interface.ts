import { AdditionnalCostType, AdditionnalCostUnit } from "../../price-requests/interfaces/price-request-additionnal-cost.interface";
import { PurchaseOrder } from "./purchase-order.interface";

export interface PurchaseOrderAdditionnalCost {
    id?: number;
    type?: AdditionnalCostType;
    denomination?: string;
    quantity?: number;
    price?: number;
    unit?: AdditionnalCostUnit;
    purchaseOrderId?: number;
    purchaseOrder?: PurchaseOrder;
}

export interface PurchaseOrderAdditionnalCostInput {
    type?: AdditionnalCostType;
    denomination?: string;
    quantity?: number;
    price?: number;
    unit?: AdditionnalCostUnit;
    purchaseOrderId?: number;
}

export interface PurchaseOrderAdditionnalCostUpdate extends PurchaseOrderAdditionnalCostInput {
    id?: number;
}