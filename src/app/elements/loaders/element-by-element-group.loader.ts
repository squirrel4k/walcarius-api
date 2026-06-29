import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, IsNull } from "typeorm";
import { ElementSql } from "../entities/element.entity";
import { OneToManySqlLoader } from "../../../core/dataloader/sql/otm-sql.loader";

@Injectable()
export class ElementByElementGroupLoader extends OneToManySqlLoader<ElementSql> {

    public constructor (
        @InjectRepository(ElementSql) elementRepo: Repository<ElementSql>
    ) {
        super(elementRepo, "elementByElementGroups", "elementGroupId", {
            where: {
                deletedAt: IsNull()
            },
            order: { name: "ASC" }
        });
    }
}