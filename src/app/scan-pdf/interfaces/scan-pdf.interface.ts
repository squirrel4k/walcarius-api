import { PurchaseOrder } from "../../purchase-orders/interfaces/purchase-order.interface";

export interface ScanPdf {
    id?: number;
    purchaseOrderId?: number;
    name?: string;
    url?: string;
    comment?: string;
    purchaseOrder?:PurchaseOrder;
    createdAt?: Date;
    deletedAt?: Date;
}

export interface InputScanPdf {
    name?: string;
    url?: string;
    purchaseOrderId?: number;
}

export interface AddScanPdfInput{
    originalname?: string;
    filename?: string;
    path?: string;
}

export interface EditScanPdfInput{
    name?: string;
    comment?: string;
}

export interface ScanPdfUpdate extends InputScanPdf { }