import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { SupplyListSql } from "./supply-list.entity";
import { Project } from "../interfaces/project.interface";
import { PurchaseOrderSql } from "../../purchase-orders/entities/purchase-order.entity";

@Entity({ name: "projects" })
export class ProjectSql implements Project {
    @PrimaryGeneratedColumn()
    public id: number;

    @Column({ length: 30 })
    public reference: string;

    @Column("boolean", { default: false })
    public isEn1090: boolean;

    @Column("timestamp", { default: () => "CURRENT_TIMESTAMP" })
    public createdAt: Date;

    @Column("timestamp", { nullable: true })
    public deletedAt: Date;

    @OneToMany(type => SupplyListSql, supplyList => supplyList.project)
    public supplyLists: SupplyListSql[];

    @OneToMany(type => PurchaseOrderSql, po => po.project)
    public purchaseOrders: PurchaseOrderSql[];
}