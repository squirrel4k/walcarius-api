import { SupplyCategory } from "../../suppliers/interfaces/supply-category.interface";
import { Element } from "../../elements/interfaces/element.interface";
import { Matter } from "../../elements/interfaces/matter.interface";
import { VariantOption, VariantOptionInpdate } from "./variant-option.interface";
import { QuantityUnit } from "../../projects/interfaces/supply-list-element.interface";

export interface Variant {
    id?: number;
    reference?: string;
    denomination?: string;
    matterRef?: string;
    quantity?: number;
    weight?: number;
    format?: string;
    isBlack?: boolean;
    isBlasted?: boolean;
    isPrimaryBlasted?: boolean;
    isCut?: boolean;
    isEn1090?: boolean;
    length?: number;
    width?: number;
    thickness?: number;
    quantityUnit?: string;
    remark?: string;
    supplyCategoryId?: number;
    matterId?: number;
    elementId?: number;
    supplyCategory?: SupplyCategory;
    element?: Element;
    matter?: Matter;
    options?: VariantOption[];
}

export interface VariantInpdate {
    id?: number;
    reference?: string;
    denomination?: string;
    matterRef?: string;
    quantity?: number;
    weight?: number;
    format?: string;
    isBlack?: boolean;
    isBlasted?: boolean;
    isPrimaryBlasted?: boolean;
    isCut?: boolean;
    isEn1090?: boolean;
    length?: number;
    width?: number;
    thickness?: number;
    quantityUnit?: string;
    remark?: string;
    supplyCategoryId?: number;
    matterId?: number;
    elementId?: number;
    options?: VariantOptionInpdate[];
}