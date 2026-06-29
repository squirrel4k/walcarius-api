import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, IsNull } from "typeorm";
import { CategorySql } from "../entities/category.entity";
import { OneToManySqlLoader } from "../../../core/dataloader/sql/otm-sql.loader";

@Injectable()
export class ChildrenCategoryLoader extends OneToManySqlLoader<CategorySql> {

    public constructor (
        @InjectRepository(CategorySql) categoryRepo: Repository<CategorySql>
    ) {
        super(categoryRepo, "childrenCategories", "parentCategoryId", {
            where: {
                deletedAt: IsNull()
            },
            order: { name: "ASC" }
        });
    }
}