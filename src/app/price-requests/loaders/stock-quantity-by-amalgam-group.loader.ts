import { Injectable } from "@nestjs/common";
import { BaseSqlLoader } from "../../../core/dataloader/sql/base-sql.loader";
import { AmalgamSql } from "../entities/amalgam.entity";
import { Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";

@Injectable()
export class StockQuantityByAmalgamGroupLoader extends BaseSqlLoader<number> {

    public constructor (
        @InjectRepository(AmalgamSql) private readonly _amalgamRepo: Repository<AmalgamSql>
    ) {
        super("stockQuantityByAmalgamGroup");
    }

    protected async findByIds(ids: number[]): Promise<number[]> {
        const result = await this._amalgamRepo.createQueryBuilder("a")
            .select("a.amalgamGroupId AS id, COUNT(a.id) AS stockQuantity")
            .where("a.isInStock = 1")
            .groupBy("a.amalgamGroupId")
            .having("a.amalgamGroupId IN (:...ids)", { ids })
            .getRawMany();

        return ids.map(baseId => {
            const relevant = result.find(res => res.id == baseId);
            return relevant ? relevant.stockQuantity : 0;
        });
    }
}