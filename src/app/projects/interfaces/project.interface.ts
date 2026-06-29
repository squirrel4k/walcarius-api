import { SupplyList, SupplyListInput } from "./supply-list.interface";
import { Sort } from "../../../core/interfaces/crud.interface";

export interface Project {
    id?: number;
    reference?: string;
    isEn1090?: boolean;
    supplyLists?: SupplyList[];
}

export interface ProjectInput {
    reference?: string;
    isEn1090?: boolean;
    supplyLists?: SupplyListInput[];
}

export interface ProjectUpdate extends ProjectInput { }

export interface ProjectFilter {
    search?: string;
}

export interface ProjectSort extends Sort {
    sortBy?: string;
}