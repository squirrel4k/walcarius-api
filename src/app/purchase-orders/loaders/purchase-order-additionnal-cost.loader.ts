import { ManyToOneSqlLoader } from "../../../core/dataloader/sql/mto-sql.loader";
import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { PurchaseOrderAdditionnalCostSql } from "../entities/purchase-order-additionnal-cost.entity";
import { Repository } from "typeorm";

@Injectable()
export class PurchaseOrderAdditionnalCostLoader extends ManyToOneSqlLoader<PurchaseOrderAdditionnalCostSql> {

    public constructor(
        @InjectRepository(PurchaseOrderAdditionnalCostSql) purchaseOrderAdditionnalCostRepo: Repository<PurchaseOrderAdditionnalCostSql>
    ) {
        super(purchaseOrderAdditionnalCostRepo, "purchaseOrderAdditionnalCosts");
    }
}