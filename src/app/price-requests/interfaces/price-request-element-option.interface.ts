import { PriceRequestElement } from "./price-request-element.interface";
import { SupplierOfferElementOption } from "./supplier-offer-element-option.interface";

export enum OptionType {
    PROCESSING = "PROCESSING",
    CUT = "CUT",
    OTHER = "OTHER"
}

export enum OptionUnit {
    EURO = "EURO",
    EURO_BY_UNIT = "EURO_BY_UNIT",
    EURO_BY_TON = "EURO_BY_TON",
    EURO_BY_METER = "EURO_BY_METER",
    EURO_BY_SQUARE_METER = "EURO_BY_SQUARE_METER"
}
export enum OptionQuantityUnit {
    TON = "TON",
    KG = "KG",
    UNIT = "UNIT",   
  }

export interface PriceRequestElementOption {
    id?: number;
    type?: OptionType;
    denomination?: string;
    quantity?: number;
    unit?: OptionUnit;
    priceRequestElementId?: number;
    priceRequestElement?: PriceRequestElement;
    supplierOfferElementOptions?: SupplierOfferElementOption[];
}

export interface PriceRequestElementOptionFilter {
    priceRequestElementId?: number;
}

export interface PriceRequestElementOptionInput {
    type?: OptionType;
    denomination?: string;
    quantity?: number;
    unit?: OptionUnit;
    priceRequestElementIds?: number[];
}

export interface PriceRequestElementOptionUpdate {
    type: OptionType;
    denomination: string;
    quantity: number;
    unit: OptionUnit;
}