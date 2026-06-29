import { Injectable } from "@nestjs/common";
import { BaseSqlLoader } from "../../../core/dataloader/sql/base-sql.loader";
import { InjectRepository } from "@nestjs/typeorm";
import { SupplyListSql } from "../entities/supply-list.entity";
import { Repository } from "typeorm";
import { SupplyListInfos } from "../interfaces/supply-list.interface";

@Injectable()
export class InfosBySupplyListLoader extends BaseSqlLoader<SupplyListInfos> {

    public constructor(
        @InjectRepository(SupplyListSql) private readonly _supplyListRepo: Repository<SupplyListSql>
    ) {
        super("infosBySupplyLists");
    }

    protected async findByIds(ids: number[]): Promise<SupplyListInfos[]> {
        const infosByList = await this._supplyListRepo.createQueryBuilder("sl")
            .select(
                "SUM(sle.isBlack) AS isBlack, SUM(sle.isBlasted) AS isBlasted, SUM(sle.isPrimaryBlasted) AS isPrimaryBlasted, sl.id AS id, "
                + "GROUP_CONCAT(DISTINCT sle.matterReference SEPARATOR '|') AS matters"
            )
            .leftJoin("supplyListElements", "sle", "sl.id = sle.supplyListId")
            .groupBy("sl.id")
            .having("sl.id IN (:...ids)", { ids })
            .getRawMany();

        return ids.map(baseId => {
            const foundInfos = infosByList.find(infos => infos.id == baseId);

            return {
                matterRefs: foundInfos && foundInfos.matters ? foundInfos.matters.split("|") : [],
                options: {
                    isBlack: foundInfos ? foundInfos.isBlack > 0 : false,
                    isBlasted: foundInfos ? foundInfos.isBlasted > 0 : false,
                    isPrimaryBlasted: foundInfos ? foundInfos.isPrimaryBlasted > 0 : false,
                }
            };
        });
    }
}