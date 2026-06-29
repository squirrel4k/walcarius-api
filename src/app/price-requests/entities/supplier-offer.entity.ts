import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToOne } from "typeorm";
import { SupplierOffer } from "../interfaces/supplier-offer.interface";
import { SupplierOfferAdditionnalCostSql } from "./supplier-offer-additionnal-cost.entity";
import { SupplierSql } from "../../suppliers/entities/supplier.entity";
import { SupplierContactSql } from "../../suppliers/entities/supplier-contact.entity";
import { PriceRequestSql } from "./price-request.entity";
import { SupplierOfferElementSql } from "./supplier-offer-element.entity";

@Entity({ name: "supplierOffers" })
export class SupplierOfferSql implements SupplierOffer {
    @PrimaryGeneratedColumn()
    public id: number;

    @Column({ length: 20, nullable: false })
    public reference: string;

    @Column({ length: 50, nullable: true })
    public supplierReference: string;

    @Column({ length: 200, nullable: true })
    public remark: string;

    @Column("boolean", { nullable: false })
    public isSent: boolean;

    @Column("timestamp", { nullable: true })
    public sendingDate: Date;

    @Column("int", { nullable: false })
    public supplierId: number;

    @Column("int", { nullable: true })
    public supplierContactId: number;

    @Column("int", { nullable: false })
    public priceRequestId: number;

    @ManyToOne(type => SupplierSql, s => s.supplierOffers)
    public supplier: SupplierSql;

    @ManyToOne(type => SupplierContactSql, sc => sc.supplierOffers)
    public supplierContact: SupplierContactSql;

    @ManyToOne(type => PriceRequestSql, pr => pr.supplierOffers)
    public priceRequest: PriceRequestSql;

    @OneToMany(type => SupplierOfferElementSql, soe => soe.supplierOffer)
    public elements: SupplierOfferElementSql[];

    @OneToMany(type => SupplierOfferAdditionnalCostSql, soac => soac.supplierOffer)
    public additionnalCosts: SupplierOfferAdditionnalCostSql[];
}