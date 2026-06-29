import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, IsNull } from "typeorm";
import { PurchaseOrderAdditionnalCostSql } from "../entities/purchase-order-additionnal-cost.entity";
import { OneToManySqlLoader } from "../../../core/dataloader/sql/otm-sql.loader";

@Injectable()
export class PurchaseOrderACByPurchaseOrderLoader extends OneToManySqlLoader<PurchaseOrderAdditionnalCostSql> {

    public constructor (
        @InjectRepository(PurchaseOrderAdditionnalCostSql) purchaseOrderAdditionnalCostRepo: Repository<PurchaseOrderAdditionnalCostSql>
    ) {
        super(purchaseOrderAdditionnalCostRepo, "purchaseOrderACsByPurchaseOrder", "purchaseOrderId", {
            where: {
                deletedAt: IsNull()
            }
        });
    }
}