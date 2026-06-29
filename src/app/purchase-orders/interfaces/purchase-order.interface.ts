import { Project } from "../../projects/interfaces/project.interface";
import { Supplier } from "../../suppliers/interfaces/supplier.interface";
import { SupplierContact } from "../../suppliers/interfaces/supplier-contact.interface";
import { PriceRequest } from "../../price-requests/interfaces/price-request.interface";
import { User } from "../../users/interfaces/user.interface";
import { PurchaseOrderAdditionnalCost } from "./purchase-order-additionnal-cost.interface";
import { PurchaseOrderElement } from "./purchase-order-element.interface";
import { Sort } from "../../../core/interfaces/crud.interface";
import { ScanPdf } from "../../scan-pdf/interfaces/scan-pdf.interface";

export interface PurchaseOrder {
    id?: number;
    reference?: string;
    status?: PurchaseOrderStatus;
    sendingDate?: Date;
    remark?: string;
    projectId?: number;
    project?: Project;
    linkedProjects?:Project[],
    supplierId?: number;
    supplier?: Supplier;
    supplierContactId?: number;
    supplierContact?: SupplierContact;
    priceRequestId?: number;
    priceRequest?: PriceRequest;
    userId?: number;
    user?: User;
    createdAt?: Date;
    deletedAt?: Date;
    additionnalCosts?: PurchaseOrderAdditionnalCost[];
    elements?: PurchaseOrderElement[];
    internalRemark?: string;
    scanPdfs?: ScanPdf[]
}

export enum PurchaseOrderStatus {
    CREATED = "CREATED",
    SENT = "SENT",
    CANCELLED = "CANCELLED"
}

export enum PurchaseOrderSortBy {
    ID = "ID",
    REFERENCE = "REFERENCE",
    SUPPLIER = "SUPPLIER",
    STATUS = "STATUS",
    CREATED_AT = "CREATED_AT",
    PRICE_REQUEST = "PRICE_REQUEST",
    REMARK = "REMARK",
    USER = "USER"
}

export interface PurchaseOrderSort extends Sort {
    sortBy?: PurchaseOrderSortBy;
}

export interface PurchaseOrderInput {
    reference?: string;
    status?: PurchaseOrderStatus;
    remark?: string;
    projectId?: number;
    userId?: number;
    priceRequestId?: number;
    supplierId?: number;
    supplierContactId?: number;
    supplierOfferId?: number;
    internalRemark?: string;
    price?: number;
    scanPdfs?: ScanPdf[];
}

export interface PurchaseOrderFromSupplierOfferInput {
    supplierOfferId: number;
    elements: SelectedSupplierOfferElement[];
    additionnalCosts: SelectedSupplierOfferAdditionnalCost[];
    reference?: string;
    userId?: number;
    status?: PurchaseOrderStatus;
}

export interface SelectedSupplierOfferElement {
    supplierOfferElementId?: number;
    priceRequestElementId?: number;
    quantity: number;
}

export interface SelectedSupplierOfferAdditionnalCost {
    supplierOfferAdditionnalCostId?: number;
    priceRequestAdditionnalCostId?: number;
    quantity?: number;
    price?: number;
}

export interface PurchaseOrderUpdate {
    status?: PurchaseOrderStatus;
    remark?: string;
    internalRemark?: string;
    supplierId?: number;
    supplierContactId?: number;
    sendingDate?: Date;
}

export enum PurchaseOrderStatusDisplay {
    CREATED = "Créé",
    SENT = "Envoyé",
    CANCELLED = "Annulé"
}

export interface PurchaseOrderFilter {
    search?: string;
}