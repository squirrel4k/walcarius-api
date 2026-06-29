import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { SupplyListElementSql } from "../entities/supply-list-element.entity";
import { OneToManySqlLoader } from "../../../core/dataloader/sql/otm-sql.loader";

@Injectable()
export class SupplyListElementBySupplyListLoader extends OneToManySqlLoader<SupplyListElementSql> {

    public constructor (
        @InjectRepository(SupplyListElementSql) supplyListElementRepo: Repository<SupplyListElementSql>
    ) {
        super(supplyListElementRepo, "supplyListElementBySupplyList", "supplyListId");
    }
}