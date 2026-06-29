import { SupplierOfferElementInpdate, SupplierOfferElement } from "./supplier-offer-element.interface";
import { SupplierOfferAdditionnalCost, SupplierOfferAdditionnalCostInpdate } from "./supplier-offer-additionnal-cost.interface";
import { Supplier } from "../../suppliers/interfaces/supplier.interface";
import { SupplierContact } from "../../suppliers/interfaces/supplier-contact.interface";
import { PriceRequest } from "./price-request.interface";

export interface SupplierOffer {
    id?: number;
    reference?: string;
    supplierReference?: string;
    remark?: string;
    isSent?: boolean;
    sendingDate?: Date;
    supplierId?: number;
    supplier?: Supplier;
    supplierContactId?: number;
    supplierContact?: SupplierContact;
    priceRequestId?: number;
    priceRequest?: PriceRequest;
    elements?: SupplierOfferElement[];
    additionnalCosts?: SupplierOfferAdditionnalCost[];
}

export interface SupplierOfferUpdate {
    supplierReference?: string;
    isSent?: boolean;
    sendingDate?: Date;
    remark?: string;
    elements?: SupplierOfferElementInpdate[];
    deletedVariantIds?: number[];
    additionnalCosts?: SupplierOfferAdditionnalCostInpdate[];
    deletedAdditionnalCostIds?: number[];
    deletedVariantOptionIds?: number[];
    deletedSupplierOfferElementOptionIds?: number[];
}

export interface SupplierInfo {
    id?: number;
    favoriteId?: number;
    code?: string;
}

export interface SupplierOfferFilter {
    priceRequestId?: number;
}