import { MongoEntity } from "../../../core/interfaces/base.interface";
import { Quote } from "./quote.interface";
import { Sort } from "../../../core/interfaces/crud.interface";

export enum QuoteProjectSortBy {
    ID = "_id",
    NAME = "name",
    REFERENCE = "reference",
    CUSTOMER = "customer",
    CREATED_AT = "createdAt"
}

interface BaseQuoteProject extends MongoEntity {
    name: string;
    reference: string;
    customer: string;
}

export interface QuoteProject extends BaseQuoteProject {
    quotes: Quote[];
    quoteIds?: string[];
}

export interface InputQuoteProject extends BaseQuoteProject {

}

export interface UpdateQuoteProject {
    name?: string;
    reference?: string;
    customer?: string;
    updatedAt?: number;
}

export interface SortQuoteProject extends Sort {
    sortBy: QuoteProjectSortBy;
}

export interface FilterQuoteProject {
    name?: string;
    reference?: string;
    customer?: string;
    createdAt?: number;
}