import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";
import { QuoteElement } from "../interfaces/quote.interface";

@Entity({ name: "quotes" })
export class QuoteEntity {

    @PrimaryGeneratedColumn()
    public id: number;

    get _id(): string { return this.id?.toString(); }

    @Column({ length: 255 })
    public name: string;

    @Column({ length: 50 })
    public number: string;

    @Column({ length: 100, nullable: true })
    public reference: string;

    @Column()
    public isEn1090: boolean;

    @Column("int", { nullable: true })
    public projectId: number;

    @Column("int", { default: 0, nullable: true })
    public status: number;

    @Column("boolean", { default: false, nullable: true })
    public needSandblasting: boolean;

    @Column("boolean", { default: false, nullable: true })
    public needMetallization: boolean;

    @Column("boolean", { default: false, nullable: true })
    public needLacquering: boolean;

    @Column("boolean", { default: false, nullable: true })
    public needPainting: boolean;

    @Column("boolean", { default: false, nullable: true })
    public needGalvanization: boolean;

    @Column("text", { nullable: true })
    public remarks: string;

    @Column("decimal", { precision: 10, scale: 2, nullable: true })
    public totalPrice: number;

    @Column("json", { nullable: true })
    public elements: QuoteElement[];

    @Column({ type: "bigint", nullable: true })
    public createdAt: number;

    @Column({ type: "bigint" })
    public updatedAt: number;

    @Column({ type: "bigint", nullable: true })
    public deletedAt: number;
}
