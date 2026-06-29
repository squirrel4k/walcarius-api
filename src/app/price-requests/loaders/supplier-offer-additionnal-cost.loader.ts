import { ManyToOneSqlLoader } from "../../../core/dataloader/sql/mto-sql.loader";
import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { SupplierOfferAdditionnalCostSql } from "../entities/supplier-offer-additionnal-cost.entity";

@Injectable()
export class SupplierOfferAdditionnalCostLoader extends ManyToOneSqlLoader<SupplierOfferAdditionnalCostSql> {

    public constructor (
        @InjectRepository(SupplierOfferAdditionnalCostSql) supplierOfferAdditionnalCostRepo: Repository<SupplierOfferAdditionnalCostSql>
    ) {
        super(supplierOfferAdditionnalCostRepo, "supplierOfferAdditionnalCosts");
    }
}