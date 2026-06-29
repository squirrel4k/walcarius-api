import { PurchaseOrderSql } from "../../purchase-orders/entities/purchase-order.entity";
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm";
import { ScanPdf } from "../interfaces/scan-pdf.interface";


@Entity({ name: "scanPdf" })
export class ScanPdfSql implements ScanPdf {
    @PrimaryGeneratedColumn()
    public id: number;

    @Column("int")
    public purchaseOrderId: number;

    @Column({ length: 20 })
    public name: string;

    @Column({ length: 20 })
    public url: string;

    @Column("text", { nullable: true })
    public comment: string;

    @Column("timestamp", { default: () => "CURRENT_TIMESTAMP" })
    public createdAt: Date;

    @Column("timestamp", { nullable: true })
    public deletedAt: Date;

    @ManyToOne(type => PurchaseOrderSql, sc => sc.scanPdfs)
    public purchaseOrder: PurchaseOrderSql;

}
