import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm";
import { SupplierOfferElementOption } from "../interfaces/supplier-offer-element-option.interface";
import { SupplierOfferElementSql } from "./supplier-offer-element.entity";
import { PriceRequestElementOptionSql } from "./price-request-element-option.entity";

@Entity({ name: "supplierOfferElementOptions" })
export class SupplierOfferElementOptionSql implements SupplierOfferElementOption {
    @PrimaryGeneratedColumn()
    public id: number;

    @Column("decimal")
    public price: number;

    @Column("int")
    public supplierOfferElementId: number;

    @Column("int")
    public priceRequestElementOptionId: number;

    @ManyToOne(type => SupplierOfferElementSql, soe => soe.options)
    public supplierOfferElement: SupplierOfferElementSql;

    @ManyToOne(type => PriceRequestElementOptionSql, preo => preo.supplierOfferElementOptions)
    public priceRequestElementOption: PriceRequestElementOptionSql;
}