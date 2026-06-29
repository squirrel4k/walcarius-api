import { SupplierContact } from "./supplier-contact.interface";
import { SupplierOffer } from "../../price-requests/interfaces/supplier-offer.interface";
import { Matter } from "../../elements/interfaces/matter.interface";

export interface Supplier {
    id?: number;
    code?: string;
    name?: string;
    mail?: string;
    phone?: string;
    remark?: string;
    deletedAt?: Date;
    contacts?: SupplierContact[];
    supplierOffers?: SupplierOffer[];
    matters?: Matter[];
}

export interface SupplierInput {
    code?: string;
    name?: string;
    mail?: string;
    phone?: string;
    remark?: string;
}

export interface SupplierUpdate {
    code?: string;
    name?: string;
    mail?: string;
    phone?: string;
    remark?: string;
}

export interface SelectedMatter {
    id?: number;
    selected?: boolean;
    name?: string;
}

export interface SelectedMattersInput {
    id?: number;
    selected?: boolean;
}

export interface SupplierFilter {
    isDeleted?: boolean;
    search?: string;
}