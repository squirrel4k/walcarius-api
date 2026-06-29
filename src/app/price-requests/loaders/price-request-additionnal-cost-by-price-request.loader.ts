import { Injectable } from "@nestjs/common";
import { PriceRequestAdditionnalCostSql } from "../entities/price-request-additionnal-cost.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { OneToManySqlLoader } from "../../../core/dataloader/sql/otm-sql.loader";

@Injectable()
export class PriceRequestAdditionnalCostByPriceRequestLoader extends OneToManySqlLoader<PriceRequestAdditionnalCostSql> {

    public constructor(
        @InjectRepository(PriceRequestAdditionnalCostSql) priceRequestAdditionnalCostRepo: Repository<PriceRequestAdditionnalCostSql>
    ) {
        super(priceRequestAdditionnalCostRepo, "priceRequestAdditionnalCostsByPriceRequest", "priceRequestId");
    }
}