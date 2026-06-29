import { ManyToOneSqlLoader } from "../../../core/dataloader/sql/mto-sql.loader";
import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { PurchaseOrderSql } from "../entities/purchase-order.entity";
import { Repository } from "typeorm";

@Injectable()
export class PurchaseOrderLoader extends ManyToOneSqlLoader<PurchaseOrderSql> {

    public constructor(
        @InjectRepository(PurchaseOrderSql) purchaseOrderRepo: Repository<PurchaseOrderSql>
    ) {
        super(purchaseOrderRepo, "purchaseOrders");
    }
}