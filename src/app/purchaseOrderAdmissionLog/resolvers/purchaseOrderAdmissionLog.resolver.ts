import { Resolver, Query, Args, Mutation } from "@nestjs/graphql";
import { UseInterceptors } from "@nestjs/common";
import { GqlLoggerInterceptor } from "../../common/interceptors/gql-logger.interceptor";
import { Access } from "../../../core/decorators/access.decorator";
import { GRANT_TOKEN } from "../../common/jwt/jwt.interface";
import { InjectRepository } from "@nestjs/typeorm";
import { getConnection, Repository } from "typeorm";
import { ErrorUtil } from "../../../core/utils/error.util";
import { IpurchaseOrderAdmissionLog, PurchaseOrderAdmissionLogInput } from "../interfaces/purchaseOrderAdmissionLog.interface";
import { PurchaseOrderAdmissionLogService } from "../services/purchaseOrderAdmissionLog.service";
import { PurchaseOrderAdmissionLogSql } from "../entities/purchaseOrderAdmissionLog.entity";

@Resolver("PurchaseOrderAdmissionLog")
@UseInterceptors(GqlLoggerInterceptor)
export class PurchaseOrderAdmissionLogResolver {
    
    public constructor(
        private readonly _purchaseOrderAdmissionLogSrv: PurchaseOrderAdmissionLogService,
        @InjectRepository(PurchaseOrderAdmissionLogSql) private readonly _purchaseOrderAdmissionLogRepo: Repository<PurchaseOrderAdmissionLogSql>,
    ) { }
    
    /**
    * @description add Admmission purchaseOrderElement 
    * @author Marie Claudia
    * @param {PurchaseOrderAdmissionLogInput} data
    * @returns {Promise<User[]>}
    * @memberof PurchaseOrderAdmissionLogResolver
    */
    @Mutation("addAdmission")
    @Access(GRANT_TOKEN.FRONT_ACCESS)
    public async addAdmission(@Args("data") data: PurchaseOrderAdmissionLogInput): Promise<IpurchaseOrderAdmissionLog> {
        return await getConnection().transaction(async transaction => {
            const admission = await this._purchaseOrderAdmissionLogSrv.create(data, transaction);
            return admission;
        }).catch(err => { throw ErrorUtil.get(err); });
    }
    
    /**
    * @description Get addmission by idElement
    * @author Marie Claudia
    * @param {number} id
    * @returns {Promise<IpurchaseOrderAdmissionLog>}
    * @memberof PurchaseOrderAdmissionLogResolver
    */
    @Query("getAdmission")
    @Access(GRANT_TOKEN.FRONT_ACCESS)
    public async getUser(@Args("id") id: number): Promise<IpurchaseOrderAdmissionLog[]> {
        return await this._purchaseOrderAdmissionLogRepo.find({idElement:id});
    }
}