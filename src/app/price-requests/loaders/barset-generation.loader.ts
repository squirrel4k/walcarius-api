import { ManyToOneSqlLoader } from "../../../core/dataloader/sql/mto-sql.loader";
import { BarsetGenerationSql } from "../entities/barset-generation.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

export class BarsetGenerationLoader extends ManyToOneSqlLoader<BarsetGenerationSql> {
    public constructor(
        @InjectRepository(BarsetGenerationSql) barsetGenerationRepo: Repository<BarsetGenerationSql>
    ) {
        super(barsetGenerationRepo, "barsetGenerations");
    }
}