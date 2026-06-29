import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, IsNull } from "typeorm";
import { PurchaseOrderElementOptionSql } from "../entities/purchase-order-element-option.entity";
import { OneToManySqlLoader } from "../../../core/dataloader/sql/otm-sql.loader";

@Injectable()
export class POElementOptionByPOElementLoader extends OneToManySqlLoader<PurchaseOrderElementOptionSql> {

    public constructor (
        @InjectRepository(PurchaseOrderElementOptionSql) purchaseOrderElementOptionRepo: Repository<PurchaseOrderElementOptionSql>
    ) {
        super(purchaseOrderElementOptionRepo, "purchaseOrderElementOptionsByPurchaseOrderElement", "purchaseOrderElementId", {
            where: {
                deletedAt: IsNull()
            }
        });
    }
}