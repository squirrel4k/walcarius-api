import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, UpdateResult } from "typeorm";
import { ErrorUtil } from "../../../core/utils/error.util";
import { BaseSqlService } from "../../../core/services/base-sql.service";
import { IpurchaseOrderAdmissionLog, PurchaseOrderAdmissionLogInput } from "../interfaces/purchase-order-admission-log.interface";
import { PurchaseOrderAdmissionLogSql } from "../entities/purchase-order-admission-log.entity";
import { PurchaseOrderAdmissionLogLoader } from "../loaders/purchase-order-admission-log.loader";


@Injectable()
export class PurchaseOrderAdmissionLogService extends BaseSqlService<PurchaseOrderAdmissionLogSql, PurchaseOrderAdmissionLogInput, PurchaseOrderAdmissionLogInput> {

    constructor(
        @InjectRepository(PurchaseOrderAdmissionLogSql) private readonly  _purchaseOrderAdmissionLogRepo: Repository<PurchaseOrderAdmissionLogSql>,
        private readonly _purchaseOrderAdmissionLogLoader: PurchaseOrderAdmissionLogLoader,
    ) { 
        super(_purchaseOrderAdmissionLogRepo, _purchaseOrderAdmissionLogLoader, PurchaseOrderAdmissionLogSql, true);
    }

    /**
    * @description add Admmission purchaseOrderElement 
    * @author Marie Claudia
    * @param {IpurchaseOrderAdmissionLog} data
    * @returns {Promise<PurchaseOrderAdmissionLogSql>}
    * @memberof PurchaseOrderAdmissionLogService
    */
    public async addAdmission(data: PurchaseOrderAdmissionLogSql): Promise<IpurchaseOrderAdmissionLog> {
        try {
            const element = await this._purchaseOrderAdmissionLogRepo.save(data);
            return element;
        } catch (e) {
            throw ErrorUtil.get(e);
        }
    }

    /**
    * @description Find a purchaseOrderAdmissionLog by its properties
    * @author Marie Claudia
    * @param {IpurchaseOrderAdmissionLog} purchaseOrderAdmissionLogProperties
    * @returns
    * @memberof PurchaseOrderAdmissionLogService
    */
    public async findByProperty(purchaseOrderAdmissionLogProperties: IpurchaseOrderAdmissionLog) {
    try {
        return await this._purchaseOrderAdmissionLogRepo.find({ where: purchaseOrderAdmissionLogProperties } as any);
    } catch (e) {
        throw ErrorUtil.get(e);
    }
    }

}