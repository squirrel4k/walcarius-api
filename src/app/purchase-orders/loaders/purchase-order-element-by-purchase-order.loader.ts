import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, IsNull } from "typeorm";
import { PurchaseOrderElementSql } from "../entities/purchase-order-element.entity";
import { OneToManySqlLoader } from "../../../core/dataloader/sql/otm-sql.loader";

@Injectable()
export class PurchaseOrderElementByPurchaseOrderLoader extends OneToManySqlLoader<PurchaseOrderElementSql> {

    public constructor (
        @InjectRepository(PurchaseOrderElementSql) purchaseOrderAdditionnalCostRepo: Repository<PurchaseOrderElementSql>
    ) {
        super(purchaseOrderAdditionnalCostRepo, "purchaseOrderElementByPurchaseOrder", "purchaseOrderId", {
            where: {
                deletedAt: IsNull()
            }
        });
    }
}