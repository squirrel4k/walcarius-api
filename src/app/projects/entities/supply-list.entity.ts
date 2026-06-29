import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToOne } from "typeorm";
import { SupplyListSource, SupplyListStatus, SupplyList } from "../interfaces/supply-list.interface";
import { SupplyListElementSql } from "./supply-list-element.entity";
import { ProjectSql } from "./project.entity";
import { PriceRequestSql } from "../../price-requests/entities/price-request.entity";

@Entity({ name: "supplyLists" })
export class SupplyListSql implements SupplyList {
    @PrimaryGeneratedColumn()
    public id: number;

    @Column({ length: 100, nullable: true })
    public description: string;

    @Column({ length: 100, nullable: true })
    public model: string;

    @Column("varchar", { length: 10 })
    public source: SupplyListSource;

    @Column("timestamp", { nullable: true })
    public deliveryDate: Date;

    @Column("varchar", { length: 15 })
    public status: SupplyListStatus;

    @Column("boolean", { default: false })
    public isAlreadyInBarset: boolean;

    @Column("int")
    public projectId: number;

    @Column("int", { nullable: true })
    public priceRequestId: number;

    @Column("timestamp", { default: () => "CURRENT_TIMESTAMP" })
    public createdAt: Date;

    @ManyToOne(type => ProjectSql, project => project.supplyLists)
    public project: ProjectSql;

    @ManyToOne(type => PriceRequestSql, pr => pr.supplyLists)
    public priceRequest: PriceRequestSql;

    @OneToMany(type => SupplyListElementSql, supplyListElement => supplyListElement.supplyList)
    public elements: SupplyListElementSql[];
}