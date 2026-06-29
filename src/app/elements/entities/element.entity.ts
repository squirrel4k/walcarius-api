import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany } from "typeorm";
import { ElementGroupSql } from "./element-group.entity";
import { MatterSql } from "./matter.entity";
import { AmalgamGroupSql } from "../../price-requests/entities/amalgam-group.entity";
import { Element } from "../interfaces/element.interface";

@Entity({ name: "elements" })
export class ElementSql implements Element {
    @PrimaryGeneratedColumn()
    public id: number;

    @Column({ length: 45 })
    public name: string;

    @Column("int")
    public elementGroupId: number;

    @ManyToOne(type => ElementGroupSql, elementGroup => elementGroup.elements)
    public elementGroup: ElementGroupSql;

    @Column("int")
    public matterId: number;

    @ManyToOne(type => MatterSql, matter => matter.elements)
    public matter: MatterSql;

    @Column("json")
    public natureValues: any;

    @Column("boolean")
    public isOrigin: boolean;

    @Column("timestamp")
    public deletedAt: Date;

    @OneToMany(type => AmalgamGroupSql, ag => ag.element)
    public amalgamGroups: AmalgamGroupSql[];
}