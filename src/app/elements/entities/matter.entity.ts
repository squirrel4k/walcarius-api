import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToMany } from "typeorm";
import { ElementSql } from "./element.entity";
import { ActionSql } from "./action.entity";
import { AmalgamGroupSql } from "../../price-requests/entities/amalgam-group.entity";
import { Matter } from "../interfaces/matter.interface";
import { SupplierSql } from "../../suppliers/entities/supplier.entity";
import { SupplyListElementSql } from "../../projects/entities/supply-list-element.entity";
import { SupplierMatterSql } from "../../suppliers/entities/supplier-matter.entity";

@Entity({ name: "matters" })
export class MatterSql implements Matter {
    @PrimaryGeneratedColumn()
    public id: number;

    @Column({ length: 60 })
    public name: string;

    @Column({ length: 60, nullable: true })
    public en1090Name: string;

    @Column("float")
    public pricePerKg: number;

    @Column("float")
    public kgByLiter: number;

    @OneToMany(type => ElementSql, element => element.matter)
    public elements: ElementSql[];

    @OneToMany(type => ActionSql, action => action.matter)
    public actions: ActionSql[];

    @OneToMany(type => AmalgamGroupSql, ag => ag.matter)
    public amalgamGroups: AmalgamGroupSql[];

    @OneToMany(type => SupplyListElementSql, sle => sle.matter)
    public supplyListElements: SupplierMatterSql[];

    @ManyToMany(type => SupplierSql, s => s.matters)
    public suppliers: SupplierSql[];
}