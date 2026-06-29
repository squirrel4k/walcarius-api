import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { ManyToOneSqlLoader } from "../../../core/dataloader/sql/mto-sql.loader";
import { PurchaseOrderAdmissionLogSql} from "../entities/purchase-order-admission-log.entity";

@Injectable()
export class PurchaseOrderAdmissionLogLoader extends ManyToOneSqlLoader<PurchaseOrderAdmissionLogSql> {

    public constructor(
        @InjectRepository(PurchaseOrderAdmissionLogSql) purchaseOrderAdmissionLogRepo: Repository<PurchaseOrderAdmissionLogSql>
    ) {
        super(purchaseOrderAdmissionLogRepo, "purchaseOrderAdmissionLog");
    }
}