import { Entity, PrimaryGeneratedColumn, Column, OneToMany, OneToOne } from "typeorm";
import { IpurchaseOrderAdmissionLog } from "../interfaces/purchase-order-admission-log.interface";

@Entity({ name: "admission" })
export class PurchaseOrderAdmissionLogSql implements IpurchaseOrderAdmissionLog {
    @PrimaryGeneratedColumn()
    public id: number;

    @Column("int")
    public quantity: number;

    @Column("timestamp", { nullable: true })
    public date: Date;

    @Column({ length: 255 , nullable: true })
    public location: string;

    @Column({ length: 255, nullable: true })
    public admitedBy: string;

    @Column("int")
    public idElement: number;
}