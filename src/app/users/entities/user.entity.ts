import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { PriceRequestSql } from "../../price-requests/entities/price-request.entity";
import { User } from "../interfaces/user.interface";
import { PurchaseOrderSql } from "../../purchase-orders/entities/purchase-order.entity";
import { USER_GROUPS } from "../enums/usergroups.enum";

@Entity({ name: "logins" })
export class UserSql implements User {
    @PrimaryGeneratedColumn()
    public id: number;

    @Column({ length: 255 })
    public username: string;

    @Column({ length: 255 })
    public password: string;

    @Column({ length: 50, nullable: true })
    public firstname: string;

    @Column({ length: 50, nullable: true })
    public lastname: string;

    @Column("boolean")
    public isAdmin: boolean;

    @Column({ length: 50, nullable: true })
    public resetToken?: string;

    @Column({ length: 30, default: USER_GROUPS.WORKSHOP })
    public userGroup?: string;

    @Column("timestamp", { nullable: true })
    public deletedAt: Date;

    @OneToMany(type => PriceRequestSql, pr => pr.user)
    public priceRequests: PriceRequestSql[];

    @OneToMany(type => PurchaseOrderSql, po => po.user)
    public purchaseOrders: PurchaseOrderSql[];
}