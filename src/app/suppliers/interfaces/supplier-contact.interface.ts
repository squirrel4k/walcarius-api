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

export interface SupplierContactInput {
    firstname?: string;
    lastname: string;
    phone?: string;
    mail?: string;
    function?: string;
    language?: string;
    supplierId: number;
    isFavorite?: boolean;
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

export interface SupplierContactFilter {
    supplierId?: number;
    isFavorite?: boolean;
    deletedAt?: any;
}
