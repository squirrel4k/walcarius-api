import { SupplierOffer } from "./supplier-offer.interface";
import { User } from "../../users/interfaces/user.interface";
import { PriceRequestAdditionnalCost } from "./price-request-additionnal-cost.interface";
import { BarsetGeneration } from "./barset-generation.interface";
import { PriceRequestElement } from "./price-request-element.interface";
import { SupplyList } from "../../projects/interfaces/supply-list.interface";
import { Sort } from "../../../core/interfaces/crud.interface";

export interface PriceRequest {
    id?: number;
    reference?: string;
    remark?: string;
    status?: PriceRequestStatus;
    isValidated?: boolean;
    isDone?: boolean;
    userId?: number;
    createdAt?: Date;
    elements?: PriceRequestElement[];
    supplierOffers?: SupplierOffer[];
    additionnalCosts?: PriceRequestAdditionnalCost[];
    user?: User;
    barsetGeneration?: BarsetGeneration;
    supplyLists?: SupplyList[];
    internalRemark?: string;
}

export interface PriceRequestInput {
    status?: PriceRequestStatus;
    reference?: string;
    remark?: string;
    userId?: number;
    supplyListIds?: number[];
    internalRemark?: string;
}

export interface PriceRequestUpdate {
    remark?: string;
    reference?: string;
    status?: PriceRequestStatus;
    isValidated?: boolean;
    isDone?: boolean;
    internalRemark?: string;
}

export interface PriceRequestFilter {
    deleted?: boolean;
    search?: string;
}

export enum PriceRequestSortBy {
    ID = "id",
    REFERENCE = "reference",
    CREATED_AT = "createdAt"
}

export interface PriceRequestSort extends Sort {
    sortBy?: PriceRequestSortBy;
}

export enum PriceRequestStatus {
    CREATED = "CREATED",
    SENT = "SENT",
    ORDERED = "ORDERED",
    PARTIALLY = "PARTIALLY"
}

export enum PriceRequestStatusDisplay {
    CREATED = "Créée",
    SENT = "Envoyée",
    ORDERED = "Dans B.C.",
    PARTIALLY = "Partiellement dans B.C."
}