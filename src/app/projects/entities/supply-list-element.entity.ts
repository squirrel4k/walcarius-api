import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany } from "typeorm";
import { SupplyListSql } from "./supply-list.entity";
import { ElementSql } from "../../elements/entities/element.entity";
import { MatterSql } from "../../elements/entities/matter.entity";
import { SupplyCategorySql } from "../../suppliers/entities/supply-category.entity";
import { PriceRequestElementSql } from "../../price-requests/entities/price-request-element.entity";
import { SupplyListElement, QuantityUnit } from "../interfaces/supply-list-element.interface";
import { AmalgamPartSql } from "../../price-requests/entities/amalgam-part.entity";
import { AmalgamPart } from "../../price-requests/interfaces/amalgam-part.interface";

@Entity({ name: "supplyListElements" })
export class SupplyListElementSql implements SupplyListElement {
    @PrimaryGeneratedColumn()
    public id: number;

    @Column({ length: 200, nullable: true })
    public reference: string;

    @Column({ length: 200, nullable: true })
    public denomination: string;

    @Column({ name: "matterReference", length: 50, nullable: true })
    public matterRef: string;

    @Column("decimal")
    public quantity: number;

    @Column("decimal", { nullable: true })
    public weight: number;

    @Column({ length: 100 })
    public format: string;

    @Column("boolean")
    public isBlack: boolean;

    @Column("boolean")
    public isBlasted: boolean;

    @Column("boolean")
    public isPrimaryBlasted: boolean;

    @Column("decimal", { nullable: true })
    public length: number;

    @Column("decimal", { nullable: true })
    public width: number;

    @Column("decimal", { nullable: true })
    public thickness: number;

    @Column({ length: 20, nullable: true })
    public quantityUnit: string;

    @Column({ length: 200, nullable: true })
    public remark: string;

    @Column("int")
    public supplyListId: number;

    @Column("int")
    public supplyCategoryId: number;

    @Column("int")
    public matterId: number;

    @Column("int")
    public elementId: number;

    @ManyToOne(type => SupplyListSql, supplyList => supplyList.elements)
    public supplyList: SupplyListSql;

    @ManyToOne(type => SupplyCategorySql)
    public supplyCategory: SupplyCategorySql;

    @ManyToOne(type => ElementSql)
    public element: ElementSql;

    @ManyToOne(type => MatterSql)
    public matter: MatterSql;

    @OneToMany(type => PriceRequestElementSql, pre => pre.supplyListElement)
    public priceRequestElements: PriceRequestElementSql[];

    @OneToMany(type => AmalgamPartSql, ap => ap.supplyListElement)
    public amalgamParts: AmalgamPart[];
}