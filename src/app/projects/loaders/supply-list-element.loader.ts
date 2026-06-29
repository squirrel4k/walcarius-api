import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { SupplyListElementSql } from "../entities/supply-list-element.entity";
import { ManyToOneSqlLoader } from "../../../core/dataloader/sql/mto-sql.loader";

@Injectable()
export class SupplyListElementLoader extends ManyToOneSqlLoader<SupplyListElementSql> {

    public constructor (
        @InjectRepository(SupplyListElementSql) supplyListElementRepo: Repository<SupplyListElementSql>
    ) {
        super(supplyListElementRepo, "supplyListElements");
    }
}