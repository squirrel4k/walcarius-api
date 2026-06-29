import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToMany } from "typeorm";
import { NatureType, Nature } from "../interfaces/nature.interface";
import { SupplyCategoryNatureSql } from "../../suppliers/entities/supply-category-nature.entity";
import { SupplyCategorySupplierSql } from "../../suppliers/entities/supply-category-supplier.entity";

@Entity({ name: "natures" })
export class NatureSql implements Nature {
    @PrimaryGeneratedColumn()
    public id: number;

    @Column({ length: 100 })
    public name: string;

    @Column({ type: "enum", enum: NatureType })
    public type: NatureType;

    @Column({ length: 255, nullable: true })
    public regex: string;

    @Column("float", { nullable: true })
    public min: number;

    @Column("float", { nullable: true })
    public max: number;

    @Column("boolean")
    public nullable: boolean;

    @Column("boolean")
    public redefine: boolean;

    @Column({ length: 45 })
    public displayName: string;

    @Column({ length: 45 })
    public unit: string;

    @OneToMany(type => SupplyCategoryNatureSql, scn => scn.nature)
    public supplyCategoryNatures: SupplyCategorySupplierSql[];
}