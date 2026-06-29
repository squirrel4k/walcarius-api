import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { PriceRequestElementSql } from "../entities/price-request-element.entity";
import { BaseSqlLoader } from "../../../core/dataloader/sql/base-sql.loader";

@Injectable()
export class BestPriceByPriceRequestElementLoader extends BaseSqlLoader<number> {

    public constructor (
        @InjectRepository(PriceRequestElementSql) private readonly _priceRequestElementRepo: Repository<PriceRequestElementSql>
    ) {
        super("bestPriceByPriceRequestElement");
    }

    protected async findByIds(ids: number[]): Promise<number[]> {
        const bestPrices = await this._priceRequestElementRepo.createQueryBuilder("pre")
            .select("MIN(soe.price) AS bestPrice, pre.id AS id")
            .leftJoin("pre.supplierOfferElements", "soe", "soe.variantId IS NULL")
            .groupBy("pre.id")
            .having("pre.id IN (:...ids)", { ids })
            .getRawMany();

        return ids.map(id => {
            const thisPrice = bestPrices.find(price => price.id == id);
            return thisPrice ? thisPrice.bestPrice : 0;
        });
    }
}