import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToMany, JoinTable } from "typeorm";
import { SupplierContactSql } from "./supplier-contact.entity";
import { Supplier } from "../interfaces/supplier.interface";
import { SupplierOfferSql } from "../../price-requests/entities/supplier-offer.entity";
import { PurchaseOrderSql } from "../../purchase-orders/entities/purchase-order.entity";
import { SupplyCategorySql } from "./supply-category.entity";
import { MatterSql } from "../../elements/entities/matter.entity";

@Entity({ name: "suppliers" })
export class SupplierSql implements Supplier {
    @PrimaryGeneratedColumn()
    public id: number;

    @Column({ length: 10 })
    public code: string;

    @Column({ length: 100 })
    public name: string;

    @Column({ length: 100, nullable: true })
    public mail: string;

    @Column({ length: 20, nullable: true })
    public phone: string;

    @Column({ length: 255, nullable: true })
    public remark: string;

    @Column("timestamp")
    public deletedAt: Date;

    @OneToMany(type => SupplierContactSql, supplierContact => supplierContact.supplier)
    public contacts: SupplierContactSql[];

    @OneToMany(type => SupplierOfferSql, so => so.supplier)
    public supplierOffers: SupplierOfferSql[];

    @OneToMany(type => PurchaseOrderSql, po => po.supplier)
    public purchaseOrders: PurchaseOrderSql[];

    @ManyToMany(type => SupplyCategorySql, sc => sc.suppliers)
    @JoinTable({ name: "supplyCategoriesSuppliers", joinColumns: [{ name: "supplierId" }], inverseJoinColumns: [{ name: "supplyCategoryId" }] })
    public supplyCategories: SupplyCategorySql[];

    @ManyToMany(type => MatterSql, m => m.suppliers)
    @JoinTable({ name: "supplierMatters", joinColumns: [{ name: "supplierId" }], inverseJoinColumns: [{ name: "matterId" }] })
    public matters: MatterSql[];
}