import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { PriceRequestSql } from "../entities/price-request.entity";
import { ManyToOneSqlLoader } from "../../../core/dataloader/sql/mto-sql.loader";

@Injectable()
export class PriceRequestLoader extends ManyToOneSqlLoader<PriceRequestSql> {

    public constructor(
        @InjectRepository(PriceRequestSql) priceRequestRepo: Repository<PriceRequestSql>
    ) {
        super(priceRequestRepo, "priceRequests");
    }
}