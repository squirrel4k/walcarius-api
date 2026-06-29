import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToOne } from "typeorm";
import { AmalgamGroup } from "../interfaces/amalgam-group.interface";
import { PriceRequestElementSql } from "./price-request-element.entity";
import { SupplyCategorySql } from "../../suppliers/entities/supply-category.entity";
import { MatterSql } from "../../elements/entities/matter.entity";
import { ElementSql } from "../../elements/entities/element.entity";
import { AmalgamSql } from "./amalgam.entity";

@Entity({ name: "amalgamGroups" })
export class AmalgamGroupSql implements AmalgamGroup {
    @PrimaryGeneratedColumn()
    public id: number;

    @Column({ length: 45, nullable: false })
    public reference: string;

    @Column({ length: 15, nullable: false })
    public format: string;

    @Column("boolean", { default: false })
    public isEn1090: boolean;

    @Column("boolean", { default: false })
    public isBlack: boolean;

    @Column("boolean", { default: false })
    public isBlasted: boolean;

    @Column("boolean", { default: false })
    public isPrimaryBlasted: boolean;

    @Column("boolean", { default: false })
    public isCut: boolean;

    @Column("boolean", { default: false })
    public isManual: boolean;

    @Column({ name: "matterReference", length: 50, nullable: true })
    public matterRef: string;

    @Column({ length: 45, nullable: true })
    public icon: string;

    @Column({ length: 200, nullable: true })
    public remark: string;

    @Column("int", { nullable: false })
    public supplyCategoryId: number;

    @Column("int", { nullable: true })
    public matterId: number;

    @Column("int", { nullable: true })
    public elementId: number;

    @ManyToOne(type => SupplyCategorySql, sc => sc.amalgamGroups)
    public supplyCategory: SupplyCategorySql;

    @ManyToOne(type => MatterSql, m => m.amalgamGroups)
    public matter: MatterSql;

    @ManyToOne(type => ElementSql, e => e.amalgamGroups)
    public element: ElementSql;

    @OneToMany(type => PriceRequestElementSql, pre => pre.amalgamGroup)
    public priceRequestElements: PriceRequestElementSql[];

    @OneToMany(type => AmalgamSql, a => a.amalgamGroup)
    public amalgams: AmalgamSql[];
}