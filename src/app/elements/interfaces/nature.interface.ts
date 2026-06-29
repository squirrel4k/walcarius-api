import { SupplyCategoryNature } from "../../suppliers/interfaces/supply-category-nature.interface";

export enum NatureType {
    STRING = "STRING",
    INT = "INT",
    FLOAT = "FLOAT",
    BOOLEAN = "BOOLEAN"
}

export interface Nature {
    name?: string;
    type?: NatureType;
    regex?: string;
    min?: number;
    max?: number;
    nullable?: boolean;
    redefine?: boolean;
    displayName?: string;
    unit?: string;

    supplyCategoryNatures?: SupplyCategoryNature[];
}