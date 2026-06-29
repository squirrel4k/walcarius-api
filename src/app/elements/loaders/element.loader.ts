import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { ElementSql } from "../entities/element.entity";
import { ManyToOneSqlLoader } from "../../../core/dataloader/sql/mto-sql.loader";

@Injectable()
export class ElementLoader extends ManyToOneSqlLoader<ElementSql> {

    public constructor (
        @InjectRepository(ElementSql) elementRepo: Repository<ElementSql>
    ) {
        super(elementRepo, "elements");
    }
}