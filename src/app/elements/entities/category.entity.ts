import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany } from "typeorm";
import { ElementGroupSql } from "./element-group.entity";
import { Category } from "../interfaces/category.interface";

@Entity({ name: "categories" })
export class CategorySql implements Category {
    @PrimaryGeneratedColumn()
    public id: number;

    @Column({ length: 45 })
    public name: string;

    @Column({ length: 45 })
    public icon: string;

    @Column("int")
    public parentCategoryId: number;

    @Column("timestamp", { nullable: true })
    public deletedAt: Date;

    @ManyToOne(type => CategorySql, category => category.childrenCategories)
    public parentCategory: CategorySql;

    @OneToMany(type => CategorySql, category => category.parentCategory)
    public childrenCategories: CategorySql[];

    @OneToMany(type => ElementGroupSql, elementGroup => elementGroup.category)
    public childrenElementGroups: ElementGroupSql[];
}