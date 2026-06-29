import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { SupplyCategory } from "../interfaces/supply-category.interface";
import { BaseSqlLoader } from "../../../core/dataloader/sql/base-sql.loader";
import { SupplierSql } from "../entities/supplier.entity";

@Injectable()
export class ParentSupplyCategoryBySupplierLoader extends BaseSqlLoader<SupplyCategory[]> {

    public constructor (
        @InjectRepository(SupplierSql) private readonly _supplierRepo: Repository<SupplierSql>
    ) {
        super("ParentSupplyCategoriesBySupplier");
    }

    protected async findByIds(ids: number[]): Promise<SupplyCategory[][]> {
        const suppliers = await this._supplierRepo.createQueryBuilder("s")
            .leftJoinAndSelect("s.supplyCategories", "sc", "sc.parentSupplyCategoryId IS NULL AND sc.deletedAt IS NULL")
            .whereInIds(ids)
            .getMany();

        return ids.map(id => {
            const foundSupplier = suppliers.find(supplier => supplier.id == id);
            return foundSupplier ? foundSupplier.supplyCategories : [];
        });
    }
}