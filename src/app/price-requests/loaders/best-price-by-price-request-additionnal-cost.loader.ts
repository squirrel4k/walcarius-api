import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { PriceRequestAdditionnalCostSql } from "../entities/price-request-additionnal-cost.entity";
import { BaseSqlLoader } from "../../../core/dataloader/sql/base-sql.loader";

@Injectable()
export class BestPriceByPriceRequestAdditionnalCostLoader extends BaseSqlLoader<number> {

    public constructor (
        @InjectRepository(PriceRequestAdditionnalCostSql) private readonly _priceRequestAdditionnalCostRepo: Repository<PriceRequestAdditionnalCostSql>
    ) {
        super("bestPriceByPriceRequestAdditionnalCost");
    }

    protected async findByIds(ids: number[]): Promise<number[]> {
        const bestPrices = await this._priceRequestAdditionnalCostRepo.createQueryBuilder("prac")
            .select("MIN(soac.price) AS bestPrice, prac.id AS id")
            .leftJoin("prac.supplierOfferAdditionnalCosts", "soac")
            .groupBy("prac.id")
            .having("prac.id IN (:...ids)", { ids })
            .getRawMany();

        return ids.map(id => {
            const thisPrice = bestPrices.find(price => price.id == id);
            return thisPrice ? thisPrice.bestPrice : 0;
        });
    }
}