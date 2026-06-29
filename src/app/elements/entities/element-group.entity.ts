import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany } from "typeorm";
import { ElementSql } from "./element.entity";
import { CategorySql } from "./category.entity";
import { ElementGroup } from "../interfaces/element-group.interface";

@Entity({ name: "elementGroups" })
export class ElementGroupSql implements ElementGroup {
    @PrimaryGeneratedColumn()
    public id: number;

    @Column({ length: 45 })
    public name: string;

    @Column({ length: 45 })
    public icon: string;

    @Column({ length: 100 })
    public useClass: string;

    @Column("int")
    public categoryId: number;

    @Column("timestamp", { nullable: true })
    public deletedAt: Date;

    @OneToMany(type => ElementSql, element => element.elementGroup)
    public elements: ElementSql[];

    @ManyToOne(type => CategorySql, category => category.childrenElementGroups)
    public category: CategorySql;
}