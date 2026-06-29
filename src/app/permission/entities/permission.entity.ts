import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { IPermission } from "../interfaces/permission.interface";

@Entity({ name: "permission" })
export class PermissionSql implements IPermission {
    @PrimaryGeneratedColumn()
    public id: number;

    @Column({ length: 255 })
    public userGroup: string;

    @Column({ length: 255 })
    public category: string;

    @Column("boolean")
    public read: boolean;

    @Column("boolean")
    public write: boolean;

    @Column("boolean")
    public delete: boolean;

    @Column("boolean")
    public seePrices: boolean;
}