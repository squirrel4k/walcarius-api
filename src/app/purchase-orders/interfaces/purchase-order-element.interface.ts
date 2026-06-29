import { PurchaseOrder } from "./purchase-order.interface";
import { SupplierOfferElement } from "../../price-requests/interfaces/supplier-offer-element.interface";
import { PurchaseOrderElementOption, PurchaseOrderElementOptionInput, PurchaseOrderElementOptionInpdate} from "./purchase-order-element-option.interface";
import { SupplyCategory } from "../../suppliers/interfaces/supply-category.interface";

export interface PurchaseOrderElement {
    id?: number;
    quantity?: number;
    denomination?: string;
    isEn1090?: boolean;
    status?: EnumPurchaseOrderElementStatus;
    isBlack?: boolean;
    isBlasted?: boolean;
    isPrimaryBlasted?: boolean;
    format?: string;
    weight?: number;
    matterRef?: string;
    quantityUnit?: string;
    thickness?: number;
    length?: number;
    width?: number;
    remark?: string;
    deliveryDate?: Date;
    realDeliveryDate?: Date;
    price?: number;
    unit?: ElementUnit;
    isPrinted?: boolean;
    purchaseOrderId?: number;
    projectRef?: string;
    purchaseOrder?: PurchaseOrder;
    supplierOfferElementId?: number;
    supplierOfferElement?: SupplierOfferElement;
    supplyCategoryId?: number;
    supplyCategory?: SupplyCategory;
    options?: PurchaseOrderElementOption[];
    qttOnqttTotal?:string;
    qttRecept?: number;
    supplierName?: string;
}
export interface FilterPurchaseOrderElement{
    category?:string[],
    reference?: string,
    project?: string,
    bdc?: string, 
    dateFrom?: Date, 
    dateTo?: Date , 
    denom?:string,
    format?:string,
    poids?:number,
    long?:number,
    larg?:number,
    remarque?:string,
    status?:string,
    thickness?:string,
}

export interface PurchaseOrderElementFilterTest {
    deleted?: boolean;
    search?: string;
}

export interface PurchaseOrderElementInput {
    quantity?: number;
    quantityUnit?: string;
    denomination?: string;
    remark?: string;
    deliveryDate?: Date;
    realDeliveryDate?: Date;
    price?: number;
    unit?: ElementUnit;
    purchaseOrderId?: number;
    supplierOfferElementId?: number;
    supplyCategoryId?: number;
    projectRef?: string;
    options?: PurchaseOrderElementOptionInput[];
}
export interface PurchaseOrderElementUpdate {
    id?: number;
    quantity?: number;
    status?:EnumPurchaseOrderElementStatus;
    quantityUnit?: string;
    denomination?: string;
    remark?: string;
    format?: string;
    deliveryDate?: Date;
    realDeliveryDate?: Date;
    price?: number;
    unit?: ElementUnit;
    isPrinted?: boolean;
    supplierOfferElementId?: number;
    options?: PurchaseOrderElementOptionInpdate[];
    deletedOptionIds?: number[];
    matterRef?: string;
    weight?: number;
    width?: number;
    length?: number;
    thickness?: number;
    isEn1090?: boolean;
    option?: string;
}

export interface PurchaseOrderElementRemarkUpdate {
    remark?: string;
}

export interface PurchaseOrderElementFormatUpdate {
    format?: string;
}

export interface PurchaseOrderElementDenominationUpdate {
    denomination?: string;
}

export interface PurchaseOrderElementMatiereUpdate {
    matterRef?: string;
}

export interface PurchaseOrderElementWeightUpdate {
    weight?: number;
}

export interface PurchaseOrderElementWidthUpdate {
    width?: number;
}

export interface PurchaseOrderElementLengthUpdate {
    length?: number;
}

export interface PurchaseOrderElementThicknessUpdate {
    thickness?: number;
}

export interface PurchaseOrderElementPriceUpdate {
    price?: number;
    unit?: ElementUnit;
}

export interface PurchaseOrderElementDeliveryDateUpdate {
    deliveryDate?: Date;
}

export interface PurchaseOrderElementEn1090Update {
    isEn1090?: boolean;
}

export interface PurchaseOrderElementOptionUpdate {
    option?: string;
}

export interface PurchaseOrderElementQuantityUpdate {
    quantity?: number;
}

export interface PurchaseOrderElementQuantityUnitUpdate {
    quantityUnit?: string;
}

export interface PurchaseOrderElementFilter {
    purchaseOrderId?: number;
}

export interface StickerInput {
    purchaseOrderElementId?: number;
    quantity?: number;
}

export interface ElementStickerData {
    id: number;
    purchaseOrderReference: string;
    supplier: string;
    deliveryDate: Date;
    matterRef: string;
    elementReference: string;
    format: string;
    quantity: number;
    weight: number;
    projectReferences: string[];
    isBlack: boolean;
    isBlasted: boolean;
    isPrimaryBlasted: boolean;
    supplyCategoryId: number;
    thickness: number;
    length: number;
    width: number;
    isVariant: boolean;
    og_reference?: string;
    og_matterRef?: string;
    og_format?: string;
    og_thickness?: number;
    og_length?: number;
    og_width?: number;
    og_isBlack?: boolean;
    og_isBlasted?: boolean;
    og_isPrimaryBlasted?: boolean;
    og_weight?: number;
    og_quantityUnit?: string;
}

export interface SqlStickerData extends PurchaseOrderElement {
    matterReference?: string;
    denomination?: string;
    poReference?: string;
    supplier?: string;
    projectReferences?: string;
    isVariant?: string;
    og_quantity?: number;
    og_reference?: string;
    og_matterRef?: string;
    og_format?: string;
    og_thickness?: number;
    og_length?: number;
    og_width?: number;
    og_isBlack?: string;
    og_isBlasted?: string;
    og_isPrimaryBlasted?: string;
    og_weight?: number;
    og_quantityUnit?: string;
}

export enum ElementUnit {
    EURO = "EURO",
    EURO_BY_UNIT = "EURO_BY_UNIT",
    EURO_BY_KG = "EURO_BY_KG",
    EURO_BY_TON = "EURO_BY_TON",
    EURO_BY_METER = "EURO_BY_METER",
    EURO_BY_SQUARE_METER = "EURO_BY_SQUARE_METER"
}

export enum EnumPurchaseOrderElementStatus {
    ATTENTE = "ATTENTE",
    ENCOURS = "ENCOURS",
    RECEPTIONNE = "RECEPTIONNE"
  }