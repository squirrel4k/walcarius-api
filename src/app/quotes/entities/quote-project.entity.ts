import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity({ name: "quote_projects" })
export class QuoteProjectEntity {

    @PrimaryGeneratedColumn()
    public id: number;

    /** Alias string pour compatibilité GraphQL (_id: ID) */
    get _id(): string { return this.id?.toString(); }

    @Column({ length: 255 })
    public name: string;

    @Column({ length: 255 })
    public reference: string;

    @Column({ length: 255 })
    public customer: string;

    @Column({ type: "int", nullable: true })
    public createdAt: number;

    @Column({ type: "int", nullable: true })
    public updatedAt: number;

    @Column({ type: "int", nullable: true })
    public deletedAt: number;
}
