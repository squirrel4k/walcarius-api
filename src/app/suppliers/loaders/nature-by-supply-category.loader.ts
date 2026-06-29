import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Nature } from "../../elements/interfaces/nature.interface";
import { BaseSqlLoader } from "../../../core/dataloader/sql/base-sql.loader";
import { SupplyCategorySql } from "../entities/supply-category.entity";

@Injectable()
export class NatureBySupplyCategoryLoader extends BaseSqlLoader<Nature[]> {

    public constructor (
        @InjectRepository(SupplyCategorySql) private readonly _supplyCategoryRepo: Repository<SupplyCategorySql>
    ) {
        super("natureBySupplyCategory");
    }

    protected async findByIds(ids: number[]): Promise<Nature[][]> {
        const supplyCategories = await this._supplyCategoryRepo.createQueryBuilder("sc")
            .leftJoinAndSelect("sc.fields", "f", "f.deletedAt IS NULL")
            .whereInIds(ids)
            .getMany();

        return ids.map(id => {
            const foundSupplyCategories = supplyCategories.find(sc => sc.id == id);
            return foundSupplyCategories ? foundSupplyCategories.fields : [];
        });
    }
}