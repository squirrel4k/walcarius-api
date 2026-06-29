import { SupplyListElement } from "../../projects/interfaces/supply-list-element.interface";
import { AmalgamGroup } from "./amalgam-group.interface";
import { SupplierOfferElement } from "./supplier-offer-element.interface";
import { PriceRequest } from "./price-request.interface";
import { PriceRequestElementOption, OptionUnit } from "./price-request-element-option.interface";
import { ElementUnit } from "../../purchase-orders/interfaces/purchase-order-element.interface";

export interface PriceRequestElement {
    id?: number;
    remark?: string;
    quantity?: number;
    weight?: number;
    priceRequestId?: number;
    priceRequest?: PriceRequest;
    supplyListElementId?: number;
    supplyListElement?: SupplyListElement;
    amalgamGroupId?: number;
    amalgamGroup?: AmalgamGroup;
    supplierOfferElements?: SupplierOfferElement[];
    options?: PriceRequestElementOption[];
    unit?: OptionUnit;
}

export interface PriceRequestElementFilter {
    priceRequestId?: number;
}

export interface PossiblePriceRequestElement {
    id?: number;
    remark?: string;
    quantity?: number;
    weight?: number;
    supplyListElementId?: number;
    supplyListElement?: SupplyListElement;
    amalgamGroupId?: number;
    amalgamGroup?: AmalgamGroup;
    supplierOfferElements?: SupplierOfferElement[];
    supplierOfferId?: number;
    isOrigin?: boolean;
    unit?: OptionUnit;
}

export interface PriceRequestElementUpdate {
    id?: number;
    remark?: string;
    quantity?: number;
    weight?: number;
    unit?: OptionUnit;
}

export enum ElementUnitCategory {
    BEAMS = "beams",
    TUBES = "tubes",
    PLATES = "plates"
}

export interface ElementUnitConfig {
    categories: {
        [category: string]: number[]
    };
    units: {
        [category: string]: {
            option: OptionUnit,
            element: ElementUnit
        }
    };
}

export enum PdfElementLineType {
    AMALGAMS,
    PLATES,
    DEFAULT
}