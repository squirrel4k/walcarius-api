import { OneToManySqlLoader } from "../../../core/dataloader/sql/otm-sql.loader";
import { PriceRequestElementOptionSql } from "../entities/price-request-element-option.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

export class PREOptionByPriceRequestElementLoader extends OneToManySqlLoader<PriceRequestElementOptionSql> {

    public constructor(
        @InjectRepository(PriceRequestElementOptionSql) priceRequestElementOptionRepo: Repository<PriceRequestElementOptionSql>
    ) {
        super(priceRequestElementOptionRepo, "PREOptionsByPriceRequestElement", "priceRequestElementId");
    }
}