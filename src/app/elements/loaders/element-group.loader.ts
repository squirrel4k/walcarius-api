import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { ElementGroupSql } from "../entities/element-group.entity";
import { Repository } from "typeorm";
import { ManyToOneSqlLoader } from "../../../core/dataloader/sql/mto-sql.loader";

@Injectable()
export class ElementGroupLoader extends ManyToOneSqlLoader<ElementGroupSql> {

    public constructor (
        @InjectRepository(ElementGroupSql) elementGroupRepo: Repository<ElementGroupSql>
    ) {
        super(elementGroupRepo, "elementGroups");
    }
}