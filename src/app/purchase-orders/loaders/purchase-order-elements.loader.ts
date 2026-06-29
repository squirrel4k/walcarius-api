import { ManyToOneSqlLoader } from "../../../core/dataloader/sql/mto-sql.loader";
import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { PurchaseOrderElementSql } from "../entities/purchase-order-element.entity";
import { Repository } from "typeorm";

@Injectable()
export class PurchaseOrderElementLoader extends ManyToOneSqlLoader<PurchaseOrderElementSql> {

    public constructor(
        @InjectRepository(PurchaseOrderElementSql) purchaseOrderElementRepo: Repository<PurchaseOrderElementSql>
    ) {
        super(purchaseOrderElementRepo, "purchaseOrderElements");
    }
}