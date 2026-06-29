import { Injectable } from "@nestjs/common";
import { ManyToOneSqlLoader } from "../../../core/dataloader/sql/mto-sql.loader";
import { PriceRequestAdditionnalCostSql } from "../entities/price-request-additionnal-cost.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

@Injectable()
export class PriceRequestAdditionnalCostLoader extends ManyToOneSqlLoader<PriceRequestAdditionnalCostSql> {

    public constructor(
        @InjectRepository(PriceRequestAdditionnalCostSql) priceRequestAdditionnalCostRepo: Repository<PriceRequestAdditionnalCostSql>
    ) {
        super(priceRequestAdditionnalCostRepo, "priceRequestAdditionnalCosts");
    }
}