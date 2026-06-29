import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany } from "typeorm";
import { OptionUnit, OptionType, PriceRequestElementOption } from "../interfaces/price-request-element-option.interface";
import { PriceRequestElementSql } from "./price-request-element.entity";
import { SupplierOfferElementOptionSql } from "./supplier-offer-element-option.entity";

@Entity({ name: "priceRequestElementOptions" })
export class PriceRequestElementOptionSql implements PriceRequestElementOption {

    @PrimaryGeneratedColumn()
    public id: number;

    @Column({ type: "enum", enum: OptionType, default: OptionType.OTHER })
    public type: OptionType;

    @Column({ length: 200, nullable: true })
    public denomination: string;

    @Column("int")
    public quantity: number;

    @Column({ type: "enum", enum: OptionUnit, default: OptionUnit.EURO })
    public unit: OptionUnit;

    @Column("int")
    public priceRequestElementId: number;

    @ManyToOne(type => PriceRequestElementSql, pre => pre.options)
    public priceRequestElement: PriceRequestElementSql;

    @OneToMany(type => SupplierOfferElementOptionSql, soeo => soeo.priceRequestElementOption)
    public supplierOfferElementOptions: SupplierOfferElementOptionSql[];
}