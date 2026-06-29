import { SupplierOfferElement } from "./supplier-offer-element.interface";
import { PriceRequestElementOption } from "./price-request-element-option.interface";

export interface SupplierOfferElementOption {
    id?: number;
    price?: number;
    supplierOfferElementId?: number;
    priceRequestElementOptionId?: number;
    supplierOfferElement?: SupplierOfferElement;
    priceRequestElementOption?: PriceRequestElementOption;
}

export interface SupplierOfferElementOptionInput {
    price?: number;
    supplierOfferElementId?: number;
    priceRequestElementOptionId?: number;
}

export interface SupplierOfferElementOptionUpdate {
    price?: number;
}

export interface SupplierOfferElementOptionInpdate {
    id?: number;
    price?: number;
    supplierOfferElementId?: number;
    priceRequestElementOptionId?: number;
}

export interface SupplierOfferElementOptionFilter {
    supplierOfferElementId?: number;
    priceRequestElementOptionId?: number;
}
