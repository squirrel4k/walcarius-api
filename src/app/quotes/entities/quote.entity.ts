import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity({ name: "quotes" })
export class QuoteEntity {

    @PrimaryGeneratedColumn()
    public id: number;

    /** Alias string pour compatibilité GraphQL (_id: ID) */
    get _id(): string { return this.id?.toString(); }

    @Column({ length: 255 })
    public name: string;

    @Column({ length: 50 })
    public number: string;

    @Column({ length: 100, nullable: true })
    public reference: string;

    @Column()
    public isEn1090: boolean;

    @Column({ type: "int" })
    public projectId: number;

    /** projectId as string for GraphQL compatibility */
    get projectIdStr(): string { return this.projectId?.toString(); }

    @Column({ type: "tinyint", default: 0 })
    public status: number;

    @Column({ default: false })
    public needSandblasting: boolean;

    @Column({ default: false })
    public needMetallization: boolean;

    @Column({ default: false })
    public needLacquering: boolean;

    @Column({ default: false })
    public needPainting: boolean;

    @Column({ default: false })
    public needGalvanization: boolean;

    @Column({ type: "text", nullable: true })
    public remarks: string;

    @Column({ type: "float", nullable: true })
    public totalPrice: number;

    @Column({ type: "simple-json", nullable: true })
    public elements: any;

    @Column({ type: "int", nullable: true })
    public createdAt: number;

    @Column({ type: "int", nullable: true })
    public updatedAt: number;

    @Column({ type: "int", nullable: true })
    public deletedAt: number;
}
