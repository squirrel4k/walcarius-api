import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { BaseSqlLoader } from "../../../core/dataloader/sql/base-sql.loader";
import { PriceRequestElementSql } from "../entities/price-request-element.entity";
import * as v4 from "uuid/v4";
import { SupplyCategoryService } from "../../suppliers/services/supply-category.service";
import { SupplyCategory } from "../../suppliers/interfaces/supply-category.interface";

@Injectable()
export class ParentSupplyCategoryByPriceRequestElementLoader extends BaseSqlLoader<SupplyCategory> {

    public constructor (
        @InjectRepository(PriceRequestElementSql) private readonly _priceRequestElementRepo: Repository<PriceRequestElementSql>,
        private readonly _supplyCategorySrv: SupplyCategoryService
    ) {
        super( "parentSupplyCategoryByPriceRequestElements");
    }

    protected async findByIds(ids: number[]): Promise<SupplyCategory[]> {
        const parentIdByPre: { id: number, parentId: number }[] = await this._priceRequestElementRepo.createQueryBuilder("pre")
            .select("pre.id AS id, COALESCE(sc.parentSupplyCategoryId, sc.id) AS parentId")
            .leftJoin("supplyListElements", "sle", "pre.supplyListElementId = sle.id")
            .leftJoin("amalgamGroups", "ag", "pre.amalgamGroupid = ag.id")
            .leftJoin("supplyCategories", "sc", "sle.supplyCategoryId = sc.id OR ag.supplyCategoryId = sc.id")
            .where("pre.id IN (:...ids)", { ids })
            .getRawMany();

        const parentIds = parentIdByPre.filter(pId => pId.parentId != null).map(pId => pId.parentId);
        const categories = await this._supplyCategorySrv.getByIds(parentIds, v4());

        return ids.map(id => {
            const catId = parentIdByPre.find(pId => pId.id == id).parentId;
            return categories.find(category => category.id == catId);
        });
    }
}