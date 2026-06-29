import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Supplier } from "../interfaces/supplier.interface";
import { BaseSqlLoader } from "../../../core/dataloader/sql/base-sql.loader";
import { SupplyCategorySql } from "../entities/supply-category.entity";

@Injectable()
export class SupplierBySupplyCategoryLoader extends BaseSqlLoader<Supplier[]> {

    public constructor (
        @InjectRepository(SupplyCategorySql) private readonly _supplyCategoryRepo: Repository<SupplyCategorySql>
    ) {
        super("supplierBySupplyCategory");
    }

    protected async findByIds(ids: number[]): Promise<Supplier[][]> {
        const supplyCategories = await this._supplyCategoryRepo.createQueryBuilder("sc")
            .leftJoinAndSelect("sc.suppliers", "s", "s.deletedAt IS NULL")
            .whereInIds(ids)
            .getMany();

        return ids.map(id => {
            const foundSupplyCategory = supplyCategories.find(sc => sc.id == id);
            return foundSupplyCategory ? foundSupplyCategory.suppliers : [];
        });
    }
}