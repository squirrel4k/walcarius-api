import { Injectable } from "@nestjs/common";
import { BaseSqlLoader } from "../../../core/dataloader/sql/base-sql.loader";
import { InjectRepository } from "@nestjs/typeorm";
import { SupplyListSql } from "../entities/supply-list.entity";
import { Repository } from "typeorm";

@Injectable()
export class TotalSupplyListByProjectLoader extends BaseSqlLoader<number> {

    public constructor(
        @InjectRepository(SupplyListSql) private readonly _supplyListRepo: Repository<SupplyListSql>
    ) {
        super("totalSupplyListByProjects");
    }

    protected async findByIds(ids: number[]): Promise<number[]> {
        const quantityByProject = await this._supplyListRepo.createQueryBuilder("sl")
            .select("COUNT(sl.id)", "totalSupplyListQty")
            .addSelect("sl.projectId", "projectId")
            .where("sl.projectId IN (:...ids)", { ids })
            .groupBy("sl.projectId")
            .getRawMany();

        return ids.map(id => {
            const found = quantityByProject.find(qbp => qbp.projectId == id);
            return found ? found.totalSupplyListQty : 0;
        });
    }
}