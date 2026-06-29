import { Entity, PrimaryColumn, ManyToOne } from "typeorm";
import { SupplyCategoryNature } from "../interfaces/supply-category-nature.interface";
import { NatureSql } from "../../elements/entities/nature.entity";
import { SupplyCategorySql } from "./supply-category.entity";

@Entity({ name: "supplyCategoryNatures" })
export class SupplyCategoryNatureSql implements SupplyCategoryNature {
    @PrimaryColumn()
    public natureId: number;

    @PrimaryColumn()
    public supplyCategoryId: number;

    @ManyToOne(type => NatureSql, n => n.supplyCategoryNatures)
    public nature: NatureSql;

    @ManyToOne(type => SupplyCategorySql, sc => sc.supplyCategoryNatures)
    public supplyCategory: SupplyCategorySql;
}