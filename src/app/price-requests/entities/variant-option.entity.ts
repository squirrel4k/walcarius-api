import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm";
import { OptionType, OptionUnit } from "../interfaces/price-request-element-option.interface";
import { VariantSql } from "./variant.entity";

@Entity({ name: "variantOptions" })
export class VariantOptionSql {
    @PrimaryGeneratedColumn()
    public id: number;

    @Column({ type: "enum", enum: OptionType, default: OptionType.OTHER })
    public type: OptionType;

    @Column({ length: 200, nullable: true })
    public denomination: string;

    @Column("int")
    public quantity: number;

    @Column("decimal")
    public price: number;

    @Column({ type: "enum", enum: OptionUnit, default: OptionUnit.EURO })
    public unit: OptionUnit;

    @Column("int")
    public variantId: number;

    @ManyToOne(type => VariantSql, variant => variant.options)
    public variant: VariantSql;
}