import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { SupplyListSql } from "../entities/supply-list.entity";
import { OneToManySqlLoader } from "../../../core/dataloader/sql/otm-sql.loader";

@Injectable()
export class SupplyListByPriceRequestLoader extends OneToManySqlLoader<SupplyListSql> {

    public constructor (
        @InjectRepository(SupplyListSql) supplyListRepo: Repository<SupplyListSql>
    ) {
        super(supplyListRepo, "supplyListsByPriceRequest", "priceRequestId");
    }
}