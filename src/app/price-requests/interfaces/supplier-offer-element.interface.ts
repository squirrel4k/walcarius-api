import { VariantInpdate, Variant } from "./variant.interface";
import { SupplierOffer } from "./supplier-offer.interface";
import { SupplierOfferElementOption, SupplierOfferElementOptionInpdate } from "./supplier-offer-element-option.interface";
import { PriceRequestElement, PriceRequestElementUpdate } from "./price-request-element.interface";
import { OptionUnit } from "./price-request-element-option.interface";

export interface SupplierOfferElement {
    id?: number;
    price?: number;
    deliveryDate?: Date;
    isSelected?: boolean;
    selectedQuantity?: number;
    parentSupplierOfferElementId?: number;
    supplierOfferId?: number;
    priceRequestElementId?: number;
    variantId?: number;
    supplierOffer?: SupplierOffer;
    priceRequestElement: PriceRequestElement;
    variant: Variant;
    options: SupplierOfferElementOption[];
    unit?: OptionUnit;
}

export interface SupplierOfferElementInpdate {
    id?: number;
    price?: number;
    deliveryDate?: Date;
    supplierOfferId?: number;
    priceRequestElementId?: number;
    priceRequestElement?: PriceRequestElementUpdate;
    variantId?: number;
    variant?: VariantInpdate;
    options?: SupplierOfferElementOptionInpdate[];
    unit?: OptionUnit;
}

export interface SupplierOfferElementUpdate {
    selectedQuantity?: number;
    isSelected?: boolean;
    price?: number;
    deliveryDate?: Date;
}

export interface SupplierOfferElementAssociation {
    supplierOfferId?: number;
    associatedPriceRequestElementIds?: number[];
    deletedSupplierOfferElementIds?: number[];
}