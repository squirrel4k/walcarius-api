import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { PriceRequestElementSql } from "../entities/price-request-element.entity";
import { Repository } from "typeorm";
import { ManyToOneSqlLoader } from "../../../core/dataloader/sql/mto-sql.loader";

@Injectable()
export class PriceRequestElementLoader extends ManyToOneSqlLoader<PriceRequestElementSql> {

    public constructor(
        @InjectRepository(PriceRequestElementSql) priceRequestElementRepo: Repository<PriceRequestElementSql>
    ) {
        super(priceRequestElementRepo, "priceRequestElements");
    }
}