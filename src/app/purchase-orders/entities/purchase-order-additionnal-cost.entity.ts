import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm";
import { PurchaseOrderAdditionnalCost } from "../interfaces/purchase-order-additionnal-cost.interface";
import { AdditionnalCostType, AdditionnalCostUnit } from "../../price-requests/interfaces/price-request-additionnal-cost.interface";
import { PurchaseOrderSql } from "./purchase-order.entity";

@Entity({ name: "purchaseOrderAdditionnalCosts" })
export class PurchaseOrderAdditionnalCostSql implements PurchaseOrderAdditionnalCost {
    @PrimaryGeneratedColumn()
    public id: number;

    @Column({ type: "enum", enum: AdditionnalCostType, default: AdditionnalCostType.OTHER })
    public type: AdditionnalCostType;

    @Column({ length: 200, nullable: true })
    public denomination: string;

    @Column("int")
    public quantity: number;

    @Column("decimal")
    public price: number;

    @Column({ type: "enum", enum: AdditionnalCostUnit, default: AdditionnalCostUnit.EURO })
    public unit: AdditionnalCostUnit;

    @Column("int")
    public purchaseOrderId: number;

    @Column("timestamp", { nullable: true })
    public deletedAt: Date;

    @ManyToOne(type => PurchaseOrderSql, po => po.additionnalCosts)
    public purchaseOrder: PurchaseOrderSql;
}