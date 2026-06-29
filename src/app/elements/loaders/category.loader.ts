import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { CategorySql } from "../entities/category.entity";
import { Repository } from "typeorm";
import { ManyToOneSqlLoader } from "../../../core/dataloader/sql/mto-sql.loader";

@Injectable()
export class CategoryLoader extends ManyToOneSqlLoader<CategorySql> {

    public constructor (
        @InjectRepository(CategorySql) categoryRepo: Repository<CategorySql>
    ) {
        super(categoryRepo, "categories");
    }
}