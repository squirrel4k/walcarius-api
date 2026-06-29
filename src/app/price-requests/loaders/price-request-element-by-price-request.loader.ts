import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { PriceRequestElementSql } from "../entities/price-request-element.entity";
import { Repository } from "typeorm";
import { BaseSqlLoader } from "../../../core/dataloader/sql/base-sql.loader";
import { PriceRequestElement } from "../interfaces/price-request-element.interface";

@Injectable()
export class PriceRequestElementByPriceRequestLoader extends BaseSqlLoader<PriceRequestElement[]> {

    public constructor(
        @InjectRepository(PriceRequestElementSql) private readonly _priceRequestElementRepo: Repository<PriceRequestElementSql>
    ) {
        super("priceRequestElementsByPriceRequestLoader");
    }

    protected async findByIds(ids: number[]): Promise<PriceRequestElement[][]> {
        const elements = await this._priceRequestElementRepo.createQueryBuilder("pre")
            .addSelect("COALESCE(sle.denomination, ag.reference) AS name_, COALESCE(sle.format, ag.format) AS format_")
            .leftJoin("pre.amalgamGroup", "ag")
            .leftJoin("pre.supplyListElement", "sle")
            .where("pre.priceRequestId IN (:...ids)", { ids })
            .orderBy("name_", "ASC")
            .addOrderBy("format_", "ASC")
            .addOrderBy("pre.id", "ASC")
            .getMany();

        return ids.map(id => elements.filter(element => element.priceRequestId == id));
    }
}