import { OptionType, OptionUnit } from "./price-request-element-option.interface";
import { Variant } from "./variant.interface";

export interface VariantOption {
    id?: number;
    type?: OptionType;
    denomination?: string;
    quantity?: number;
    price?: number;
    unit?: OptionUnit;
    variantId?: number;
    variant?: Variant;
}

export interface VariantOptionFilter {
    variantId: number;
}

export interface VariantOptionInput {
    type?: OptionType;
    denomination?: string;
    quantity?: number;
    price?: number;
    unit?: OptionUnit;
    variantId?: number;
}

export interface VariantOptionUpdate {
    type?: OptionType;
    denomination?: string;
    quantity?: number;
    price?: number;
    unit?: OptionUnit;
}

export interface VariantOptionInpdate {
    id?: number;
    type?: OptionType;
    denomination?: string;
    quantity?: number;
    price?: number;
    unit?: OptionUnit;
    variantId?: number;
}