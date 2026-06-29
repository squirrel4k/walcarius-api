import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm";
import { ActionGroupSql } from "./action-group.entity";
import { MatterSql } from "./matter.entity";
import { Action } from "../interfaces/action.interface";

@Entity({ name: "actions" })
export class ActionSql implements Action {
    @PrimaryGeneratedColumn()
    public id: number;

    @Column({ length: 45 })
    public name: string;

    @Column("json")
    public natureValues: any;

    @Column("int")
    public actionGroupId: number;

    @Column("int")
    public matterId: number;

    @Column("timestamp", { nullable: true })
    public deletedAt: Date;

    @ManyToOne(type => ActionGroupSql, actionGroup => actionGroup.actions)
    public actionGroup: ActionGroupSql;

    @ManyToOne(type => MatterSql, matter => matter.actions)
    public matter: MatterSql;
}