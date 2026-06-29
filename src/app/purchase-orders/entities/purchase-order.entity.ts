import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany } from "typeorm";
import { PurchaseOrder, PurchaseOrderStatus } from "../interfaces/purchase-order.interface";
import { ProjectSql } from "../../projects/entities/project.entity";
import { SupplierSql } from "../../suppliers/entities/supplier.entity";
import { SupplierContactSql } from "../../suppliers/entities/supplier-contact.entity";
import { PriceRequestSql } from "../../price-requests/entities/price-request.entity";
import { UserSql } from "../../users/entities/user.entity";
import { PurchaseOrderAdditionnalCostSql } from "./purchase-order-additionnal-cost.entity";
import { PurchaseOrderElementSql } from "./purchase-order-element.entity";
import { ScanPdfSql } from "../../scan-pdf/entities/scan-pdf.entity";

@Entity({ name: "purchaseOrders" })
export class PurchaseOrderSql implements PurchaseOrder {
    @PrimaryGeneratedColumn()
    public id: number;

    @Column({ length: 20 })
    public reference: string;

    @Column({ type: "enum", enum: PurchaseOrderStatus, default: PurchaseOrderStatus.CREATED })
    public status: PurchaseOrderStatus;

    @Column("timestamp", { nullable: true })
    public sendingDate: Date;

    @Column("text", { nullable: true })
    public remark: string;

    @Column("int", { nullable: true })
    public projectId: number;

    @Column("int", { nullable: true })
    public supplierId: number;

    @Column("int", { nullable: true })
    public supplierContactId: number;

    @Column("int", { nullable: true })
    public priceRequestId: number;

    @Column("int", { name: "loginId" })
    public userId: number;

    @Column("timestamp", { default: () => "CURRENT_TIMESTAMP" })
    public createdAt: Date;

    @Column("timestamp", { nullable: true })
    public deletedAt: Date;

    @Column("text", { nullable: true })
    public internalRemark: string;

    @ManyToOne(type => ProjectSql, project => project.purchaseOrders)
    public project: ProjectSql;

    // @ManyToOne(type => ProjectSql, project => project.purchaseOrders)
    // public linkedProjects: ProjectSql[];

    @ManyToOne(type => SupplierSql, supplier => supplier.purchaseOrders)
    public supplier: SupplierSql;

    @ManyToOne(type => SupplierContactSql, sc => sc.purchaseOrders)
    public supplierContact: SupplierContactSql;

    @ManyToOne(type => PriceRequestSql, pr => pr.purchaseOrders)
    public priceRequest: PriceRequestSql;

    @ManyToOne(type => UserSql, user => user.purchaseOrders)
    @JoinColumn({ name: "loginId" })
    public user: UserSql;
    
    // @OneToMany(type => ScanPdfSql, pdf => pdf.purchaseOrder)
    // public filePdf: ScanPdfSql[];

    @OneToMany(type => PurchaseOrderAdditionnalCostSql, poac => poac.purchaseOrder)
    public additionnalCosts: PurchaseOrderAdditionnalCostSql[];

    @OneToMany(type => PurchaseOrderElementSql, poe => poe.purchaseOrder)
    public elements: PurchaseOrderElementSql[];
    
    @OneToMany(type => ScanPdfSql, p => p.purchaseOrder)
    public scanPdfs: ScanPdfSql[];
}