import { Injectable } from "@nestjs/common";
import { OneToManySqlLoader } from "../../../core/dataloader/sql/otm-sql.loader";
import { Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";
import { SupplierOfferAdditionnalCostSql } from "../entities/supplier-offer-additionnal-cost.entity";

@Injectable()
export class SupplierOfferAdditionnalCostBySupplierOfferLoader extends OneToManySqlLoader<SupplierOfferAdditionnalCostSql> {

    public constructor (
        @InjectRepository(SupplierOfferAdditionnalCostSql) supplierOfferAdditionnalCostRepo: Repository<SupplierOfferAdditionnalCostSql>
    ) {
        super(supplierOfferAdditionnalCostRepo, "supplierOfferAdditionnalCostBySupplierOffer", "supplierOfferId");
    }
}