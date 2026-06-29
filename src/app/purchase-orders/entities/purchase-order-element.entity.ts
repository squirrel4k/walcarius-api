import { PurchaseOrderElement, ElementUnit, EnumPurchaseOrderElementStatus } from "../interfaces/purchase-order-element.interface";
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany } from "typeorm";
import { PurchaseOrderSql } from "./purchase-order.entity";
import { SupplierOfferElementSql } from "../../price-requests/entities/supplier-offer-element.entity";
import { PurchaseOrderElementOptionSql } from "./purchase-order-element-option.entity";
import { SupplyCategorySql } from "../../suppliers/entities/supply-category.entity";

@Entity({ name: "purchaseOrderElements" })
export class PurchaseOrderElementSql implements PurchaseOrderElement {
    @PrimaryGeneratedColumn()
    public id: number;

    @Column("decimal")
    public quantity: number;

    @Column({ length: 200, nullable: true })
    public denomination: string;

    @Column({ type: "enum", enum: EnumPurchaseOrderElementStatus, default: EnumPurchaseOrderElementStatus.ATTENTE })
    public status: EnumPurchaseOrderElementStatus;

    @Column("boolean", { default: false })
    public isEn1090: boolean;

    @Column("boolean", { default: false })
    public isBlack: boolean;

    @Column("boolean", { default: false })
    public isBlasted: boolean;

    @Column("boolean", { default: false })
    public isPrimaryBlasted: boolean;

    @Column({ length: 20, nullable: true })
    public format: string;

    @Column("decimal", { nullable: true })
    public weight: number;

    @Column({ name: "matterReference", length: 20, nullable: true })
    public matterRef: string;

    @Column({ length: 20, nullable: true })
    public quantityUnit: string;

    @Column("decimal", { nullable: true })
    public thickness: number;

    @Column("decimal", { nullable: true })
    public length: number;

    @Column("decimal", { nullable: true })
    public width: number;

    @Column({ length: 200, nullable: true })
    public remark: string;

    @Column("timestamp", { nullable: true })
    public deliveryDate: Date;

    @Column("timestamp", { nullable: true })
    public realDeliveryDate: Date;

    @Column("decimal", { nullable: true })
    public price: number;

    @Column({ type: "enum", enum: ElementUnit, default: ElementUnit.EURO })
    public unit: ElementUnit;

    @Column("boolean", { default: false })
    public isPrinted: boolean;

    @Column("smallint", { default: 0 })
    public printedQuantity: number;

    @Column("int")
    public purchaseOrderId: number;

    @Column("int", { nullable: true })
    public supplierOfferElementId: number;

    @Column("int", { nullable: true })
    public supplyCategoryId: number;

    @Column({ length: 20, nullable: true })
    public projectRef: string;

    @Column("timestamp", { nullable: true })
    public deletedAt: Date;

    @ManyToOne(type => PurchaseOrderSql, po => po.elements)
    public purchaseOrder: PurchaseOrderSql;

    @ManyToOne(type => SupplierOfferElementSql, soe => soe.purchaseOrderElements)
    public supplierOfferElement: SupplierOfferElementSql;

    @ManyToOne(type => SupplyCategorySql, sc => sc.purchaseOrderElements)
    public supplyCategory: SupplyCategorySql;

    @OneToMany(type => PurchaseOrderElementOptionSql, poeo => poeo.purchaseOrderElement)
    public options: PurchaseOrderElementOptionSql[];
    
    @Column("timestamp", { default: () => "CURRENT_TIMESTAMP" })
    public createdAt: Date;

    public supplierName: string;

}