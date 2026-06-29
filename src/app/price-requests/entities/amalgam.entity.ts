import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany } from "typeorm";
import { Amalgam } from "../interfaces/amalgam.interface";
import { AmalgamGroupSql } from "./amalgam-group.entity";
import { AmalgamPartSql } from "./amalgam-part.entity";

@Entity({ name: "amalgams" })
export class AmalgamSql implements Amalgam {
    @PrimaryGeneratedColumn()
    public id: number;

    @Column("int", { nullable: false })
    public loss: number;

    @Column("boolean", { default: false })
    public isLocked: boolean;

    @Column("boolean", { default: false })
    public isInStock: boolean;

    @Column({ length: 50, nullable: true })
    public stockPosition: string;

    @Column("int", { nullable: false })
    public amalgamGroupId: number;

    @ManyToOne(type => AmalgamGroupSql, ag => ag.amalgams)
    public amalgamGroup: AmalgamGroupSql;

    @OneToMany(type => AmalgamPartSql, ap => ap.amalgam)
    public parts: AmalgamPartSql[];
}