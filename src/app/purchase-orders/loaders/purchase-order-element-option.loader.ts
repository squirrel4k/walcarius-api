import { ManyToOneSqlLoader } from "../../../core/dataloader/sql/mto-sql.loader";
import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { PurchaseOrderElementOptionSql } from "../entities/purchase-order-element-option.entity";
import { Repository } from "typeorm";

@Injectable()
export class PurchaseOrderElementOptionLoader extends ManyToOneSqlLoader<PurchaseOrderElementOptionSql> {

    public constructor(
        @InjectRepository(PurchaseOrderElementOptionSql) purchaseOrderElementOptionRepo: Repository<PurchaseOrderElementOptionSql>
    ) {
        super(purchaseOrderElementOptionRepo, "purchaseOrderElementOptions");
    }
}