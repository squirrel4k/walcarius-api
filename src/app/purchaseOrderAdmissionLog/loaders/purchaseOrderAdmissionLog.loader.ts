import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { ManyToOneSqlLoader } from "../../../core/dataloader/sql/mto-sql.loader";
import { PurchaseOrderAdmissionLogSql} from "../entities/purchaseOrderAdmissionLog.entity";

@Injectable()
export class PurchaseOrderAdmissionLogLoader extends ManyToOneSqlLoader<PurchaseOrderAdmissionLogSql> {

    public constructor(
        @InjectRepository(PurchaseOrderAdmissionLogSql) purchaseOrderAdmissionLogRepo: Repository<PurchaseOrderAdmissionLogSql>
    ) {
        super(purchaseOrderAdmissionLogRepo, "purchaseOrderAdmissionLog");
    }
}