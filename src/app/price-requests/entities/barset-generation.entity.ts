import { BarsetGeneration } from "../interfaces/barset-generation.interface";
import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn } from "typeorm";
import { PriceRequestSql } from "./price-request.entity";

@Entity({ name: "barsetGenerations" })
export class BarsetGenerationSql implements BarsetGeneration {
    @PrimaryGeneratedColumn()
    public id: number;

    @Column("smallint", { nullable: true })
    public beamLength: number;

    @Column("json", { nullable: true })
    public beamOtherLengths: number[];

    @Column("boolean", { default: false })
    public beamIsAutoCut: boolean;

    @Column("smallint", { nullable: true })
    public beamCutThreshold: number;

    @Column("smallint", { nullable: true })
    public beamMaxLoss: number;

    @Column("smallint", { nullable: true })
    public tubeLength: number;

    @Column("json", { nullable: true })
    public tubeOtherLengths: number[];

    @Column("boolean", { default: false })
    public tubeIsAutoCut: boolean;

    @Column("smallint", { nullable: true })
    public tubeCutThreshold: number;

    @Column("smallint", { nullable: true })
    public tubeMaxLoss: number;

    @Column("mediumint", { nullable: true })
    public generationDuration: number;

    @Column("int", { nullable: true })
    public partsTotalLength: number;

    @Column("int", { nullable: true })
    public amalgamsTotalLength: number;

    @Column("mediumint", { nullable: true })
    public partsQuantity: number;

    @Column("mediumint", { nullable: true })
    public amalgamsQuantity: number;

    @Column({
        type: "int",
        asExpression: "`amalgamsTotalLength` - `partsTotalLength`",
        generatedType: "VIRTUAL",
        update: false,
        insert: false
    })
    public totalLoss: number;

    @Column({
        type: "decimal",
        asExpression: "((`amalgamsTotalLength` - `partsTotalLength`) / `amalgamsTotalLength`) * 100",
        generatedType: "VIRTUAL",
        update: false,
        insert: false
    })
    public lossPercent: number;

    @Column("int")
    public priceRequestId: number;

    @Column("timestamp", { default: () => "CURRENT_TIMESTAMP" })
    public createdAt: Date;

    @OneToOne(type => PriceRequestSql, pr => pr.barsetGeneration)
    @JoinColumn({ name: "priceRequestId" })
    public priceRequest: PriceRequestSql;
}