import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { QuoteEntity } from "../entities/quote.entity";
import { ManyToOneSqlLoader } from "../../../core/dataloader/sql/mto-sql.loader";

@Injectable()
export class QuoteLoader extends ManyToOneSqlLoader<QuoteEntity> {

    public constructor(
        @InjectRepository(QuoteEntity) repo: Repository<QuoteEntity>
    ) {
        super(repo, "quotes");
    }
}
