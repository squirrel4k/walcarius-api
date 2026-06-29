import { Entity, Column, PrimaryGeneratedColumn } from "typeorm";

@Entity({ name: "actionGroupParameters" })
export class ActionGroupParameterSql {
    @PrimaryGeneratedColumn()
    public id: number;

    @Column("int")
    public parameterId: number;

    @Column("int")
    public actionGroupId: number;
}