import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { ActionSql } from "./action.entity";
import { ActionGroup } from "../interfaces/action-group.interface";

@Entity({ name: "actionGroups" })
export class ActionGroupSql implements ActionGroup {
    @PrimaryGeneratedColumn()
    public id: number;

    @Column({ length: 100 })
    public name: string;

    @Column({ length: 100 })
    public useClass: string;

    @OneToMany(type => ActionSql, action => action.actionGroup)
    public actions: ActionSql[];
}