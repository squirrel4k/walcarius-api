import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { PriceRequestElementSql } from "../entities/price-request-element.entity";
import { BaseSqlLoader } from "../../../core/dataloader/sql/base-sql.loader";

@Injectable()
export class BestTimeByPriceRequestElementLoader extends BaseSqlLoader<Date> {

    public constructor (
        @InjectRepository(PriceRequestElementSql) private readonly _priceRequestElementRepo: Repository<PriceRequestElementSql>
    ) {
        super("bestTimeByPriceRequestElement");
    }

    protected async findByIds(ids: number[]): Promise<Date[]> {
        const bestTimes = await this._priceRequestElementRepo.createQueryBuilder("pre")
            .select("MIN(soe.deliveryDate) AS bestTime, pre.id AS id")
            .leftJoin("supplierOfferElements", "soe", "pre.id = soe.priceRequestElementId")
            .groupBy("pre.id")
            .having("pre.id IN (:...ids)", { ids })
            .getRawMany();

        return ids.map(id => {
            const thisTime = bestTimes.find(time => time.id == id);
            return thisTime ? thisTime.bestTime : null;
        });
    }
}