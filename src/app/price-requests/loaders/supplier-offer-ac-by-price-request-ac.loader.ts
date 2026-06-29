import { Injectable } from "@nestjs/common";
import { OneToManySqlLoader } from "../../../core/dataloader/sql/otm-sql.loader";
import { SupplierOfferAdditionnalCostSql } from "../entities/supplier-offer-additionnal-cost.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

@Injectable()
export class SupplierOfferACByPriceRequestACLoader extends OneToManySqlLoader<SupplierOfferAdditionnalCostSql> {

    public constructor(
        @InjectRepository(SupplierOfferAdditionnalCostSql) supplierOfferAdditionnalCostRepo: Repository<SupplierOfferAdditionnalCostSql>
    ) {
        super(supplierOfferAdditionnalCostRepo, "supplierOfferACByPriceRequestAC", "priceRequestAdditionnalCostId");
    }
}