import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { BaseSqlLoader } from "../../../core/dataloader/sql/base-sql.loader";
import { PriceRequestElementSql } from "../entities/price-request-element.entity";

@Injectable()
export class HasPriceByPriceRequestElementLoader extends BaseSqlLoader<boolean> {

    public constructor (
        @InjectRepository(PriceRequestElementSql) private readonly _priceRequestElementRepo: Repository<PriceRequestElementSql>,
    ) {
        super("hasPriceByPriceRequestElement");
    }

    protected async findByIds(ids: number[]): Promise<boolean[]> {
        const priceCountByPRE = await this._priceRequestElementRepo.createQueryBuilder("pre")
            .select("pre.id, COUNT(soe.id) AS priceCount")
            .leftJoin("pre.supplierOfferElements", "soe", "soe.price IS NOT NULL")
            .where("pre.id IN (:...ids)", { ids })
            .groupBy("pre.id")
            .getRawMany();

        return ids.map(id => {
            const related = priceCountByPRE.find(price => price.id == id);
            return !!related && related.priceCount > 0;
        });
    }
}