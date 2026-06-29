import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm";
import { SupplierOfferSql } from "./supplier-offer.entity";
import { SupplierOfferAdditionnalCost } from "../interfaces/supplier-offer-additionnal-cost.interface";
import { PriceRequestAdditionnalCostSql } from "./price-request-additionnal-cost.entity";
import { AdditionnalCostUnit } from "../interfaces/price-request-additionnal-cost.interface";

@Entity({ name: "supplierOfferAdditionnalCosts" })
export class SupplierOfferAdditionnalCostSql implements SupplierOfferAdditionnalCost {
    @PrimaryGeneratedColumn()
    public id: number;

    @Column("decimal")
    public price: number;

    @Column("decimal")
    public inputPrice: number;

    @Column({ length: 200, nullable: true })
    public denomination: string;

    @Column("smallint")
    public quantity: number;

    @Column({ type: "enum", enum: AdditionnalCostUnit, default: AdditionnalCostUnit.EURO })
    public unit: AdditionnalCostUnit;

    @Column("int")
    public supplierOfferId: number;

    @Column("int")
    public priceRequestAdditionnalCostId: number;

    @ManyToOne(type => SupplierOfferSql, so => so.additionnalCosts)
    public supplierOffer: SupplierOfferSql;

    @ManyToOne(type => PriceRequestAdditionnalCostSql, prac => prac.supplierOfferAdditionnalCosts)
    public priceRequestAdditionnalCost: PriceRequestAdditionnalCostSql;
}