import { OneToOneSqlLoader } from "../../../core/dataloader/sql/oto-sql.loader";
import { BarsetGenerationSql } from "../entities/barset-generation.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

export class BarsetGenerationByPriceRequestLoader extends OneToOneSqlLoader<BarsetGenerationSql> {
    public constructor(
        @InjectRepository(BarsetGenerationSql) barsetGenerationRepo: Repository<BarsetGenerationSql>
    ) {
        super(barsetGenerationRepo, "barsetGenerations", "priceRequestId");
    }
}