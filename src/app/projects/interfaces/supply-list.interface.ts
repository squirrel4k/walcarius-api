import { SupplyListElement, SupplyListElementInput, SupplyListElementUpdate } from "./supply-list-element.interface";
import { Project } from "./project.interface";
import { PriceRequest } from "../../price-requests/interfaces/price-request.interface";
import { Sort } from "../../../core/interfaces/crud.interface";

export enum SupplyListStatus {
    OPEN = "OPEN",
    TAKEN = "TAKEN"
}

export enum SupplyListSource {
    MANUAL = "MANUAL",
    TEKLA = "TEKLA"
}

export interface SupplyList {
    id?: number;
    description?: string;
    model?: string;
    source?: SupplyListSource;
    deliveryDate?: Date;
    status?: SupplyListStatus;
    isAlreadyInBarset?: boolean;
    projectId?: number;
    priceRequestId?: number;
    elements?: SupplyListElement[];
    createdAt?: Date;
    project?: Project;
    priceRequest?: PriceRequest;
}

export interface SupplyListInput {
    description?: string;
    model?: string;
    source?: SupplyListSource;
    deliveryDate?: Date;
    status?: SupplyListStatus;
    isAlreadyInBarset?: boolean;
    projectId?: number;
    elements?: SupplyListElementInput[];
}

export interface SupplyListUpdate {
    id?: number;
    description?: string;
    model?: string;
    source?: SupplyListSource;
    deliveryDate?: Date;
    status?: SupplyListStatus;
    isAlreadyInBarset?: boolean;
    projectId?: number;
    elements?: SupplyListElementUpdate[];
}

export interface SupplyListFilter {
    projectId?: number;
    priceRequestId?: number;
    status?: SupplyListStatus;
}

export enum SupplyListSortBy {
    ID = "id",
    DESCRIPTION = "description",
    MODEL = "model",
    SOURCE = "source",
    DELIVERY_DATE = "deliveryDate",
    STATUS = "status",
    CREATED_AT = "createdAt"
}

export interface SupplyListSort extends Sort {
    sortBy: SupplyListSortBy;
}

export interface SupplyListInfos {
    matterRefs?: String[];
    options?: SupplyListOptions;
}

export interface SupplyListOptions {
    isBlack: boolean;
    isBlasted: boolean;
    isPrimaryBlasted: boolean;
}