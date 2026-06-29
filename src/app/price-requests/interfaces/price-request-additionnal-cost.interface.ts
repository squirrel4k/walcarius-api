import { PriceRequest } from "./price-request.interface";
import { SupplierOfferAdditionnalCost } from "./supplier-offer-additionnal-cost.interface";

export enum AdditionnalCostType {
    TRANSPORT_FEE = "TRANSPORT_FEE",
    PACKAGING_FEE = "PACKAGING_FEE",
    CERTIFICATE_FEE = "CERTIFICATE_FEE",
    OTHER = "OTHER"
}

export enum AdditionnalCostUnit {
    EURO = "EURO",
    EURO_BY_UNIT = "EURO_BY_UNIT"
}

export interface PriceRequestAdditionnalCost {
    id?: number;
    type?: AdditionnalCostType;
    denomination?: string;
    quantity?: number;
    unit?: AdditionnalCostUnit;
    priceRequestId?: number;
    priceRequest?: PriceRequest;
    supplierOfferAdditionnalCosts?: SupplierOfferAdditionnalCost[];
}

export interface PriceRequestAdditionnalCostInput {
    type?: AdditionnalCostType;
    denomination?: string;
    quantity?: number;
    unit?: AdditionnalCostUnit;
    priceRequestId?: number;
}

export interface PriceRequestAdditionnalCostUpdate {
    id?: number;
    type?: AdditionnalCostType;
    denomination?: string;
    quantity?: number;
    unit?: AdditionnalCostUnit;
}

export interface PriceRequestAdditionnalCostInpdate {
    id?: number;
    type?: AdditionnalCostType;
    denomination?: string;
    quantity?: number;
    unit?: AdditionnalCostUnit;
    priceRequestId?: number;
}

export interface PriceRequestAdditionnalCostFilter {
    priceRequestId?: number;
}

export interface MergedAdditionnalCost {
    priceRequestAdditionnalCostId: number;
    type: AdditionnalCostType;
    denomination?: string;
    quantity: number;
    unit: AdditionnalCostUnit;
    supplierOfferAdditionnalCostId?: number;
    price?: number;
}