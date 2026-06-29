import { SupplierOffer } from "./supplier-offer.interface";
import { AdditionnalCostUnit, PriceRequestAdditionnalCost, PriceRequestAdditionnalCostInput } from "./price-request-additionnal-cost.interface";

export interface SupplierOfferAdditionnalCost {
    id?: number;
    price?: number;
    inputPrice?: number;
    denomination?: string;
    quantity: number;
    unit: AdditionnalCostUnit;
    supplierOfferId?: number;
    supplierOffer?: SupplierOffer;
    priceRequestAdditionnalCostId?: number;
    priceRequestAdditionnalCost?: PriceRequestAdditionnalCost;
}

export interface SupplierOfferAdditionnalCostInput {
    price?: number;
    inputPrice?: number;
    denomination?: string;
    quantity: number;
    unit: AdditionnalCostUnit;
    supplierOfferId?: number;
    priceRequestAdditionnalCostId?: number;
}

export interface SupplierOfferAdditionnalCostUpdate {
    id?: number;
    price?: number;
    inputPrice?: number;
    denomination?: string;
    quantity: number;
    unit: AdditionnalCostUnit;
}

export interface SupplierOfferAdditionnalCostInpdate {
    id?: number;
    price?: number;
    inputPrice?: number;
    denomination: string;
    quantity: number;
    unit: AdditionnalCostUnit;
    supplierOfferId?: number;
    priceRequestAdditionnalCostId?: number;
    priceRequestAdditionnalCost?: PriceRequestAdditionnalCostInput;
}

export interface SupplierOfferAdditionnalCostFilter {
    supplierOfferId?: number;
    priceRequestAdditionnalCostId?: number;
}