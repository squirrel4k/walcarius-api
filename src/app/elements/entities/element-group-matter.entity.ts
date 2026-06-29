import { Entity, Column, PrimaryGeneratedColumn } from "typeorm";

@Entity({ name: "elementGroupMatters" })
export class ElementGroupMatterSql {
    @PrimaryGeneratedColumn()
    public id: number;

    @Column("int")
    public matterId: number;

    @Column("int")
    public elementGroupId: number;
}