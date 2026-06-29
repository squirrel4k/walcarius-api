import { Entity, Column, PrimaryGeneratedColumn } from "typeorm";

@Entity({ name: "elementGroupNatures" })
export class ElementGroupNatureSql {
    @PrimaryGeneratedColumn()
    public id: number;

    @Column("int")
    public natureId: number;

    @Column("int")
    public elementGroupId: number;
}