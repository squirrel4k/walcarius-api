import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany } from "typeorm";
import { PriceRequestElement } from "../interfaces/price-request-element.interface";
import { PriceRequestSql } from "./price-request.entity";
import { SupplyListElementSql } from "../../projects/entities/supply-list-element.entity";
import { AmalgamGroupSql } from "./amalgam-group.entity";
import { PriceRequestElementOptionSql } from "./price-request-element-option.entity";
import { SupplierOfferElementSql } from "./supplier-offer-element.entity";
import { OptionUnit } from "../interfaces/price-request-element-option.interface";

@Entity({ name: "priceRequestElements" })
export class PriceRequestElementSql implements PriceRequestElement {
    @PrimaryGeneratedColumn()
    public id: number;

    @Column({ length: 200, nullable: true })
    public remark: string;

    @Column("decimal", { nullable: false })
    public quantity: number;

    @Column("decimal", { nullable: true })
    public weight: number;

    @Column("int", { nullable: false })
    public priceRequestId: number;

    @Column("int", { nullable: true })
    public supplyListElementId: number;

    @Column("int", { nullable: true })
    public amalgamGroupId: number;

    @Column({ type: "enum", enum: OptionUnit, default: OptionUnit.EURO_BY_UNIT,nullable:true  })
    public unit: OptionUnit;

    @ManyToOne(type => PriceRequestSql, priceRequest => priceRequest.priceRequestElements)
    public priceRequest: PriceRequestSql;

    @ManyToOne(type => SupplyListElementSql, sle => sle.priceRequestElements)
    public supplyListElement: SupplyListElementSql;

    @ManyToOne(type => AmalgamGroupSql, ag => ag.priceRequestElements)
    public amalgamGroup: AmalgamGroupSql;

    @OneToMany(type => SupplierOfferElementSql, soe => soe.priceRequestElement)
    public supplierOfferElements: SupplierOfferElementSql[];

    @OneToMany(type => PriceRequestElementOptionSql, preo => preo.priceRequestElement)
    public options: PriceRequestElementOptionSql[];

    @Column("timestamp", { default: "current_timestamp" })
    public createdAt: Date;
}