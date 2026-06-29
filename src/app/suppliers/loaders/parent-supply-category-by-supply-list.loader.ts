import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { SupplyCategory } from "../interfaces/supply-category.interface";
import { SupplyCategorySql } from "../entities/supply-category.entity";
import { SupplyCategoryLoader } from "./supply-category.loader";
import { BaseSqlLoader } from "../../../core/dataloader/sql/base-sql.loader";

@Injectable()
export class ParentSupplyCategoryBySupplyListLoader extends BaseSqlLoader<SupplyCategory[]> {

    public constructor (
        @InjectRepository(SupplyCategorySql) private readonly _supplyCategoryRepo: Repository<SupplyCategorySql>,
        private readonly _supplyCategoryLoader: SupplyCategoryLoader
    ) {
       super("parentSupplyCategoryBySupplyList");
    }

    protected async findByIds(ids: number[]): Promise<SupplyCategory[][]> {
        const categoriesByList = await this._supplyCategoryRepo.createQueryBuilder("sc")
            .select("DISTINCT COALESCE(sc.parentSupplyCategoryId, sc.id) AS supplyCategoryId, sle.supplyListId")
            .leftJoin("supplyListElements", "sle", "sc.id = sle.supplyCategoryId")
            .where("sle.supplyListId IN (:...ids)", { ids })
            .getRawMany();

        if (categoriesByList.length == 0) { return ids.map(id => []); }
        const supplyCategories = await this._supplyCategoryLoader.get("").load(categoriesByList.map(cat => cat.supplyCategoryId));

        return ids.map(id => {
            return categoriesByList.filter(catByList => catByList.supplyListId == id)
                .map(catByList => catByList.supplyCategoryId)
                .map(catId => supplyCategories.find(category => category.id == catId));
        });
    }
}