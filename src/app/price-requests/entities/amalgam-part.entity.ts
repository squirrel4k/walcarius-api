import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm";
import { AmalgamPart } from "../interfaces/amalgam-part.interface";
import { AmalgamSql } from "./amalgam.entity";
import { SupplyListElementSql } from "../../projects/entities/supply-list-element.entity";

@Entity({ name: "amalgamParts" })
export class AmalgamPartSql implements AmalgamPart {

    @PrimaryGeneratedColumn()
    public id: number;

    @Column("int", { nullable: false })
    public amalgamId: number;

    @Column("int", { nullable: false })
    public supplyListElementId: number;

    @ManyToOne(type => AmalgamSql, a => a.parts)
    public amalgam: AmalgamSql;

    @ManyToOne(type => SupplyListElementSql, sle => sle.amalgamParts)
    public supplyListElement: SupplyListElementSql;
}