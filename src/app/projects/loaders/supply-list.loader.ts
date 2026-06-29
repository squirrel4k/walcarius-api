import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { SupplyListSql } from "../entities/supply-list.entity";
import { ManyToOneSqlLoader } from "../../../core/dataloader/sql/mto-sql.loader";

@Injectable()
export class SupplyListLoader extends ManyToOneSqlLoader<SupplyListSql> {

    public constructor (
        @InjectRepository(SupplyListSql) supplyListRepo: Repository<SupplyListSql>
    ) {
        super(supplyListRepo, "supplyLists");
    }
}