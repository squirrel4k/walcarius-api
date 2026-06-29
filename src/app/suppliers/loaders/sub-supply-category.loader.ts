import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, IsNull } from "typeorm";
import { SupplyCategorySql } from "../entities/supply-category.entity";
import { OneToManySqlLoader } from "../../../core/dataloader/sql/otm-sql.loader";

@Injectable()
export class SubSupplyCategoryLoader extends OneToManySqlLoader<SupplyCategorySql> {

    public constructor (
        @InjectRepository(SupplyCategorySql) supplyCategoryRepo: Repository<SupplyCategorySql>
    ) {
        super(supplyCategoryRepo, "subSupplyCategories", "parentSupplyCategoryId", {
            where: {
                deletedAt: IsNull()
            }
        });
    }
}