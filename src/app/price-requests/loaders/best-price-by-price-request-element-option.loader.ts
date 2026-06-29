import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { BaseSqlLoader } from "../../../core/dataloader/sql/base-sql.loader";
import { PriceRequestElementOptionSql } from "../entities/price-request-element-option.entity";

@Injectable()
export class BestPriceByPriceRequestElementOptionLoader extends BaseSqlLoader<number> {

    public constructor (
        @InjectRepository(PriceRequestElementOptionSql) private readonly _priceRequestElementOptionRepo: Repository<PriceRequestElementOptionSql>
    ) {
        super("bestPriceByPriceRequestElement");
    }

    protected async findByIds(ids: number[]): Promise<number[]> {
        const bestPrices = await this._priceRequestElementOptionRepo.createQueryBuilder("preo")
            .select("MIN(soeo.price) AS bestPrice, preo.id AS id")
            .leftJoin("preo.supplierOfferElementOptions", "soeo")
            .groupBy("preo.id")
            .having("preo.id IN (:...ids)", { ids })
            .getRawMany();

        return ids.map(id => {
            const thisPrice = bestPrices.find(price => price.id == id);
            return thisPrice ? thisPrice.bestPrice : 0;
        });
    }
}