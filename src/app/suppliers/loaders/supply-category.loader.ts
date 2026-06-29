import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { SupplyCategorySql } from "../entities/supply-category.entity";
import { ManyToOneSqlLoader } from "../../../core/dataloader/sql/mto-sql.loader";

@Injectable()
export class SupplyCategoryLoader extends ManyToOneSqlLoader<SupplyCategorySql> {

    public constructor (
        @InjectRepository(SupplyCategorySql) supplyCategoryRepo: Repository<SupplyCategorySql>
    ) {
        super(supplyCategoryRepo, "supplyCategories");
    }
}