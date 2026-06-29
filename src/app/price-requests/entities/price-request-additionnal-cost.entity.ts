import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany } from "typeorm";
import { AdditionnalCostType, AdditionnalCostUnit, PriceRequestAdditionnalCost } from "../interfaces/price-request-additionnal-cost.interface";
import { PriceRequestSql } from "./price-request.entity";
import { SupplierOfferAdditionnalCostSql } from "./supplier-offer-additionnal-cost.entity";

@Entity({ name: "priceRequestAdditionnalCosts" })
export class PriceRequestAdditionnalCostSql implements PriceRequestAdditionnalCost {

    @PrimaryGeneratedColumn()
    public id: number;

    @Column({ type: "enum", enum: AdditionnalCostType, default: AdditionnalCostType.OTHER })
    public type: AdditionnalCostType;

    @Column({ length: 200, nullable: true })
    public denomination: string;

    @Column("smallint")
    public quantity: number;

    @Column({ type: "enum", enum: AdditionnalCostUnit, default: AdditionnalCostUnit.EURO })
    public unit: AdditionnalCostUnit;

    @Column("int")
    public priceRequestId: number;

    @ManyToOne(type => PriceRequestSql, pr => pr.additionnalCosts)
    public priceRequest: PriceRequestSql;

    @OneToMany(type => SupplierOfferAdditionnalCostSql, soac => soac.priceRequestAdditionnalCost)
    public supplierOfferAdditionnalCosts: SupplierOfferAdditionnalCostSql[];
}