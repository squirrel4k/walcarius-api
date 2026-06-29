import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany } from "typeorm";
import { SupplierSql } from "./supplier.entity";
import { SupplierContact } from "../interfaces/supplier-contact.interface";
import { SupplierOfferSql } from "../../price-requests/entities/supplier-offer.entity";
import { PurchaseOrderSql } from "../../purchase-orders/entities/purchase-order.entity";

@Entity({ name: "supplierContacts" })
export class SupplierContactSql implements SupplierContact {
    @PrimaryGeneratedColumn()
    public id: number;

    @Column({ length: 30, nullable: true })
    public firstname: string;

    @Column({ length: 30 })
    public lastname: string;

    @Column({ length: 20, nullable: true })
    public phone: string;

    @Column({ length: 100, nullable: true })
    public mail: string;

    @Column({ length: 100, nullable: true })
    public function: string;

    @Column("boolean", { default: false })
    public isFavorite: boolean;

    @Column({ length: 10 })
    public language: string;

    @Column("int")
    public supplierId: number;

    @Column("timestamp")
    public deletedAt: Date;

    @ManyToOne(type => SupplierSql, supplier => supplier.contacts)
    public supplier: SupplierSql;

    @OneToMany(type => SupplierOfferSql, so => so.supplierContact)
    public supplierOffers: SupplierOfferSql[];

    @OneToMany(type => PurchaseOrderSql, po => po.supplierContact)
    public purchaseOrders: PurchaseOrderSql[];
}