import { ManyToOneSqlLoader } from "../../../core/dataloader/sql/mto-sql.loader";
import { PriceRequestElementOptionSql } from "../entities/price-request-element-option.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Injectable } from "@nestjs/common";

@Injectable()
export class PriceRequestElementOptionLoader extends ManyToOneSqlLoader<PriceRequestElementOptionSql> {

    public constructor(
        @InjectRepository(PriceRequestElementOptionSql) priceRequestElementOptionRepo: Repository<PriceRequestElementOptionSql>
    ) {
        super(priceRequestElementOptionRepo, "priceRequestElementOptions");
    }
}