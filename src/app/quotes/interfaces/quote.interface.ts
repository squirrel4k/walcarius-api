import { MongoEntity } from "../../../core/interfaces/base.interface";
import { QuoteProject } from "./quote-project.interface";
import { Sort } from "../../../core/interfaces/crud.interface";

export enum QuoteSortBy {
    ID = "id",
    NAME = "name",
    NUMBER = "number",
    REFERENCE = "reference",
    IS_EN_1090 = "isEn1090",
    CREATED_AT = "createdAt",
    UPDATED_AT = "updatedAt"
}

export enum QuoteStatusEnum {
    CREATED = 0,
    VALIDATED = 1,
    SENT = 2
}

export enum AdditionalComputingType {
    OPERATION = "OPERATION",
    ASSEMBLAGE = "ASSEMBLAGE"
}

interface BaseQuote extends MongoEntity {
    name: string;
    number: string;
    reference?: string;
    isEn1090: boolean;
    projectId: string;
    status?: number;
    needSandblasting?: boolean;
    needMetallization?: boolean;
    needLacquering?: boolean;
    needPainting?: boolean;
    needGalvanization?: boolean;
    remarks?: string;
    totalPrice?: number;
}

export interface Quote extends BaseQuote {
    project: QuoteProject;
    elements?: QuoteElement[];
}

export interface InputQuote extends BaseQuote {
    elements?: InputQuoteElement[];
}

export class UpdateQuote {
    _id?: string;
    name: string;
    number: string;
    reference?: string;
    isEn1090: boolean;
    needSandblasting?: boolean;
    needMetallization?: boolean;
    needLacquering?: boolean;
    needPainting?: boolean;
    needGalvanization?: boolean;
    remarks?: string;
    elements: InputQuoteElement[];
    projectId: string;
    updatedAt: number;
    totalPrice?: number;
}

export interface SortQuote extends Sort {
    sortBy: QuoteSortBy;
}

export interface FilterQuote {
    name: string;
    number: string;
    reference: string;
    isEn1090: boolean;
    createdAt: number;
}

interface BaseQuoteElement {
    isVisible: boolean;
    quantity: number;
    unitPrice: number;
    customCost?: number;
    customName?: string;
    additionalCost?: number;
    unitaryAdditionalCost?: number;
    globalAdditionalCost?: number;
    remarks?: string;
    useClass: string;
    content: any;
}

export interface QuoteElement extends BaseQuoteElement {
    children?: QuoteElement[];
    additionalComputings?: AdditionalComputing[];
}

export interface InputQuoteElement extends BaseQuoteElement {
    children?: InputQuoteElement[];
    additionalComputings?: InputAdditionalComputing[];
}

interface BaseAdditionalComputing {
    name: string;
    unitPrice: number;
    customCost?: number;
    customName?: string;
    additionalCost?: number;
    unitaryAdditionalCost?: number;
    globalAdditionalCost?: number;
    type: string;
    useClass: string;
    properties?: any;
    remarks?: string;
}

export interface AdditionalComputing extends BaseAdditionalComputing {

}

export interface InputAdditionalComputing extends BaseAdditionalComputing {

}

export interface DisplayQuote {
    _id?: string;
    name?: string;
    number?: string;
    reference?: string;
    isEn1090?: boolean;
    projectId?: string;
}