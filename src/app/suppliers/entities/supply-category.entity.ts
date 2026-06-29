import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToOne, OneToOne, JoinColumn, ManyToMany, JoinTable } from "typeorm";
import { ElementGroupSql } from "../../elements/entities/element-group.entity";
import { SupplyCategory } from "../interfaces/supply-category.interface";
import { AmalgamGroupSql } from "../../price-requests/entities/amalgam-group.entity";
import { PurchaseOrderElementSql } from "../../purchase-orders/entities/purchase-order-element.entity";
import { SupplyCategoryNatureSql } from "./supply-category-nature.entity";
import { NatureSql } from "../../elements/entities/nature.entity";
import { SupplierSql } from "./supplier.entity";

@Entity({ name: "supplyCategories" })
export class SupplyCategorySql implements SupplyCategory {
    @PrimaryGeneratedColumn()
    public id: number;

    @Column({ length: 80 })
    public name: string;

    @Column("int", { nullable: true })
    public parentSupplyCategoryId: number;

    @Column("int", { nullable: true })
    public elementGroupId: number;

    @Column("timestamp", { nullable: true })
    public deletedAt: Date;

    @OneToMany(type => SupplyCategorySql, supplyCategory => supplyCategory.parentSupplyCategory)
    public subCategories: SupplyCategorySql[];

    @ManyToOne(type => SupplyCategorySql, supplyCategory => supplyCategory.subCategories)
    public parentSupplyCategory: SupplyCategorySql;

    @OneToOne(type => ElementGroupSql)
    @JoinColumn({ name: "elementGroupId" })
    public elementGroup: ElementGroupSql;

    @OneToMany(type => AmalgamGroupSql, ag => ag.supplyCategory)
    public amalgamGroups: AmalgamGroupSql[];

    @OneToMany(type => PurchaseOrderElementSql, poe => poe.supplyCategory)
    public purchaseOrderElements: PurchaseOrderElementSql[];

    @OneToMany(type => SupplyCategoryNatureSql, scn => scn.supplyCategory)
    public supplyCategoryNatures: SupplyCategoryNatureSql[];

    @ManyToMany(type => NatureSql)
    @JoinTable({ name: "supplyCategoryNatures", joinColumns: [{ name: "supplyCategoryId" }], inverseJoinColumns: [{ name: "natureId" }] })
    public fields: NatureSql[];

    @ManyToMany(type => SupplierSql, s => s.supplyCategories)
    public suppliers: SupplierSql[];
}