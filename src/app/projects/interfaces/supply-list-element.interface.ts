import { Matter } from "../../elements/interfaces/matter.interface";
import { SupplyCategory } from "../../suppliers/interfaces/supply-category.interface";
import { SupplyList } from "./supply-list.interface";
import { Element } from "../../elements/interfaces/element.interface";
import { AmalgamPart } from "../../price-requests/interfaces/amalgam-part.interface";

export interface SupplyListElement {
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
    length?: number;
    width?: number;
    thickness?: number;
    quantityUnit?: string;
    remark?: string;
    supplyListId?: number;
    supplyList?: SupplyList;
    supplyCategoryId?: number;
    supplyCategory?: SupplyCategory;
    elementId?: number;
    element?: Element;
    matterId?: number;
    matter?: Matter;
    amalgamParts?: AmalgamPart[];
    isEn1090?: boolean; // Virtual field
}

export interface SupplyListElementInput {
    reference?: string;
    denomination?: string;
    matterRef?: string;
    quantity?: number;
    weight?: number;
    format?: string;
    isBlack?: boolean;
    isBlasted?: boolean;
    isPrimaryBlasted?: boolean;
    length?: number;
    width?: number;
    thickness?: number;
    quantityUnit?: string;
    basicQuantityUnit?: string;
    remark?: string;
    supplyListId?: number;
    supplyCategoryId?: number;
    elementId?: number;
    matterId?: number;
}

export interface SupplyListElementUpdate extends SupplyListElementInput {
    id?: number;
}

export interface AmalgamSupplyListElement extends SupplyListElement {
    isEn1090: boolean;
    icon?: string;
    isAlreadyInBarset: boolean;
}

export enum QuantityUnit {
    UNIT = "UNIT",
    KG = "KG",
    TON = "TON"
}