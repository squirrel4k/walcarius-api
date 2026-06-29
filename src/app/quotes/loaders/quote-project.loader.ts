import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { QuoteProjectEntity } from "../entities/quote-project.entity";
import { ManyToOneSqlLoader } from "../../../core/dataloader/sql/mto-sql.loader";

@Injectable()
export class QuoteProjectLoader extends ManyToOneSqlLoader<QuoteProjectEntity> {

    public constructor(
        @InjectRepository(QuoteProjectEntity) repo: Repository<QuoteProjectEntity>
    ) {
        super(repo, "quoteProjects");
    }
}