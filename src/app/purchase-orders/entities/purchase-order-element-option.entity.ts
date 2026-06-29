import { PurchaseOrderElementOption } from "../interfaces/purchase-order-element-option.interface";
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm";
import { OptionType, OptionUnit } from "../../price-requests/interfaces/price-request-element-option.interface";
import { PurchaseOrderElementSql } from "./purchase-order-element.entity";

@Entity({ name: "purchaseOrderElementOptions" })
export class PurchaseOrderElementOptionSql implements PurchaseOrderElementOption {
    @PrimaryGeneratedColumn()
    public id: number;

    @Column({ type: "enum", enum: OptionType, default: OptionType.OTHER })
    public type: OptionType;

    @Column({ length: 200, nullable: true })
    public denomination: string;

    @Column("int")
    public quantity: number;

    @Column("decimal")
    public price: number;

    @Column({ type: "enum", enum: OptionUnit, default: OptionUnit.EURO })
    public unit: OptionUnit;

    @Column("int")
    public purchaseOrderElementId: number;

    @Column("timestamp", { nullable: true })
    public deletedAt: Date;

    @ManyToOne(type => PurchaseOrderElementSql, poe => poe.options)
    public purchaseOrderElement: PurchaseOrderElementSql;
}