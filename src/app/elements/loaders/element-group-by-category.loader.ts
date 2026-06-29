import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, IsNull } from "typeorm";
import { ElementGroupSql } from "../entities/element-group.entity";
import { OneToManySqlLoader } from "../../../core/dataloader/sql/otm-sql.loader";

@Injectable()
export class ElementGroupByCategoryLoader extends OneToManySqlLoader<ElementGroupSql> {

    public constructor (
        @InjectRepository(ElementGroupSql) elementRepo: Repository<ElementGroupSql>
    ) {
        super(elementRepo, "elementGroupByCategories", "categoryId", {
            where: {
                deletedAt: IsNull()
            },
            order: { name: "ASC" }
        });
    }
}