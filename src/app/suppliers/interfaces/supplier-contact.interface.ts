import { Supplier } from "./supplier.interface";
import { SupplierOffer } from "../../price-requests/interfaces/supplier-offer.interface";

export interface SupplierContact {
    id?: number;
    firstname?: string;
    lastname?: string;
    phone?: string;
    mail?: string;
    function?: string;
    isFavorite?: boolean;
    language?: string;
    supplierId?: number;
    deletedAt?: Date;
    supplier?: Supplier;
    supplierOffers?: SupplierOffer[];
}

export interface SupplierContactFilter {
    supplierId?: number;
    deletedAt?: any;
}

export interface SupplierContactInput {
    firstname?: string;
    lastname?: string;
    phone?: string;
    mail?: string;
    function?: string;
    isFavorite?: boolean;
    language?: string;
    supplierId?: number;
}

export interface SupplierContactUpdate {
    firstname?: string;
    lastname?: string;
    phone?: string;
    mail?: string;
    function?: string;
    isFavorite?: boolean;
    language?: string;
}