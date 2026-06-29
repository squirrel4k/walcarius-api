import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToOne, OneToMany } from "typeorm";
import { SupplyCategorySql } from "../../suppliers/entities/supply-category.entity";
import { ElementSql } from "../../elements/entities/element.entity";
import { MatterSql } from "../../elements/entities/matter.entity";
import { SupplierOfferElementSql } from "./supplier-offer-element.entity";
import { VariantOptionSql } from "./variant-option.entity";
import { Variant } from "../interfaces/variant.interface";

@Entity({ name: "variants" })
export class VariantSql implements Variant {
    @PrimaryGeneratedColumn()
    public id: number;

    @Column({ length: 50, nullable: true })
    public reference: string;

    @Column({ length: 200, nullable: true })
    public denomination: string;

    @Column({ name: "matterReference", length: 50, nullable: true })
    public matterRef: string;

    @Column("decimal")
    public quantity: number;

    @Column("decimal", { nullable: true })
    public weight: number;

    @Column({ length: 20 })
    public format: string;

    @Column("boolean")
    public isBlack: boolean;

    @Column("boolean")
    public isBlasted: boolean;

    @Column("boolean")
    public isPrimaryBlasted: boolean;

    @Column("boolean")
    public isCut: boolean;

    @Column("boolean")
    public isEn1090: boolean;

    @Column({ length: 200, nullable: true })
    public remark: string;

    @Column("decimal", { nullable: true })
    public length: number;

    @Column("decimal", { nullable: true })
    public width: number;

    @Column("decimal", { nullable: true })
    public thickness: number;

    @Column({ length: 20, nullable: true })
    public quantityUnit: string;

    @Column("int")
    public supplyCategoryId: number;

    @Column("int")
    public matterId: number;

    @Column("int")
    public elementId: number;

    @ManyToOne(type => SupplyCategorySql)
    public supplyCategory: SupplyCategorySql;

    @ManyToOne(type => ElementSql)
    public element: ElementSql;

    @ManyToOne(type => MatterSql)
    public matter: MatterSql;

    @OneToOne(type => SupplierOfferElementSql, soe => soe.variant)
    public supplierOfferElement: SupplierOfferElementSql;

    @OneToMany(type => VariantOptionSql, vo => vo.variant)
    public options: VariantOptionSql[];
}