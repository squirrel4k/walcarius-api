import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToOne, JoinColumn, OneToOne } from "typeorm";
import { PriceRequest, PriceRequestStatus } from "../interfaces/price-request.interface";
import { PriceRequestElementSql } from "./price-request-element.entity";
import { SupplierOfferSql } from "./supplier-offer.entity";
import { PurchaseOrderSql } from "../../purchase-orders/entities/purchase-order.entity";
import { UserSql } from "../../users/entities/user.entity";
import { PriceRequestAdditionnalCostSql } from "./price-request-additionnal-cost.entity";
import { BarsetGenerationSql } from "./barset-generation.entity";
import { SupplyListSql } from "../../projects/entities/supply-list.entity";

@Entity({ name: "priceRequests" })
export class PriceRequestSql implements PriceRequest {

    @PrimaryGeneratedColumn()
    public id: number;

    @Column({ length: 20, nullable: false })
    public reference: string;

    @Column("text", { nullable: true })
    public remark: string;

    @Column({ type: "enum", enum: PriceRequestStatus, default: PriceRequestStatus.CREATED  })
    public status: PriceRequestStatus;

    @Column("boolean", { default: false })
    public isValidated: boolean;

    @Column("boolean", { default: false })
    public isDone: boolean;

    @Column("int", { name: "loginId" })
    public userId: number;

    @Column("timestamp", { default: "current_timestamp" })
    public createdAt: Date;

    @Column("timestamp", { nullable: true })
    public deletedAt: Date;

    @Column("text", { nullable: true })
    public internalRemark: string;

    @OneToOne(type => BarsetGenerationSql, bg => bg.priceRequest)
    public barsetGeneration: BarsetGenerationSql;

    @OneToMany(type => PriceRequestElementSql, pre => pre.priceRequest)
    public priceRequestElements: PriceRequestElementSql[];

    @OneToMany(type => SupplierOfferSql, so => so.priceRequest)
    public supplierOffers: SupplierOfferSql[];

    @OneToMany(type => PriceRequestAdditionnalCostSql, prac => prac.priceRequest)
    public additionnalCosts: PriceRequestAdditionnalCostSql[];

    @OneToMany(type => PurchaseOrderSql, po => po.priceRequest)
    public purchaseOrders: PurchaseOrderSql[];

    @OneToMany(type => SupplyListSql, sl => sl.priceRequest)
    public supplyLists: SupplyListSql[];

    @ManyToOne(type => UserSql, user => user.priceRequests)
    @JoinColumn({ name: "loginId" })
    public user: UserSql;
}