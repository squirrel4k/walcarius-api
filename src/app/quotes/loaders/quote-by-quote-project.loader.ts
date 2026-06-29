import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, IsNull } from "typeorm";
import { QuoteEntity } from "../entities/quote.entity";
import { OneToManySqlLoader } from "../../../core/dataloader/sql/otm-sql.loader";

@Injectable()
export class QuoteByQuoteProjectLoader extends OneToManySqlLoader<QuoteEntity> {

    public constructor(
        @InjectRepository(QuoteEntity) repo: Repository<QuoteEntity>
    ) {
        super(repo, "quotesByQuoteProjects", "projectId", {
            where: { deletedAt: IsNull() },
            order: { updatedAt: "ASC" }
        });
    }
}