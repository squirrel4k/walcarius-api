import { Resolver, Query, Args, Mutation } from "@nestjs/graphql";
import { UseInterceptors } from "@nestjs/common";
import { GqlLoggerInterceptor } from "../../common/interceptors/gql-logger.interceptor";
import { Access } from "../../../core/decorators/access.decorator";
import { GRANT_TOKEN } from "../../common/jwt/jwt.interface";
import { InjectRepository } from "@nestjs/typeorm";
import { getConnection, Repository } from "typeorm";
import { ErrorUtil } from "../../../core/utils/error.util";
import { ScanPdfService } from "../services/scan-pdf.service";
import { ScanPdfSql } from "../entities/scan-pdf.entity";
import { EditScanPdfInput, InputScanPdf, ScanPdf } from "../interfaces/scan-pdf.interface";

@Resolver("ScanPdfResolver")
@UseInterceptors(GqlLoggerInterceptor)
export class ScanPdfResolver {
    
    public constructor(
        private readonly _scanPdfSrv: ScanPdfService,
        @InjectRepository(ScanPdfSql) private readonly _scanPdfRepo: Repository<ScanPdfSql>,
    ) { }
    
    /**
    * @description add ScanPdf PurchaseOrder 
    * @author Marie Claudia
    * @param {InputScanPdf} data
    * @returns {Promise<ScanPdf>}
    * @memberof ScanPdfResolver
    */
    @Mutation("addScanpdf")
    @Access(GRANT_TOKEN.FRONT_ACCESS)
    public async addScanpdf(@Args("data") data: InputScanPdf): Promise<ScanPdf> {
        return await getConnection().transaction(async transaction => {
            const scanpdf = await this._scanPdfSrv.create(data, transaction);
            return scanpdf;
        }).catch(err => { throw ErrorUtil.get(err); });
    }
    
    /**
    * @description edit ScanPdf PurchaseOrder 
    * @author Raphaël Michaux
    * @param {InputScanPdf} data
    * @returns {Promise<ScanPdf>}
    * @memberof ScanPdfResolver
    */
    @Mutation("editScanpdf")
    @Access(GRANT_TOKEN.FRONT_ACCESS)
    public async editScanpdf(@Args("id") id: number, @Args("data") data: EditScanPdfInput): Promise<ScanPdf> {
        return await getConnection().transaction(async transaction => {
            return await this._scanPdfSrv.update(id, data, transaction);
        }).catch(err => { throw ErrorUtil.get(err); });
    }
    
    /**
    * @description Get ScanPdf PurchaseOrder by purchaseId
    * @author Marie Claudia
    * @param {number} purchaseOrderId
    * @returns {Promise<ScanPdf>}
    * @memberof ScanPdfResolver
    */
    @Query("getScanPdf")
    @Access(GRANT_TOKEN.FRONT_ACCESS)
    public async getScanPdf(@Args("purchaseOrderId") purchaseOrderId: number): Promise<ScanPdf[]> {
       return await this._scanPdfSrv.findByProperty({ purchaseOrderId: purchaseOrderId,deletedAt: null});  
    }

    @Mutation("deleteScanPdf")
    @Access(GRANT_TOKEN.FRONT_ACCESS)
    public async deleteScanPdf(@Args("id") id: number): Promise<boolean> {
        return await getConnection().transaction(async manager => {   
            return await this._scanPdfSrv.delete(id, manager);
        }).catch(err => { throw ErrorUtil.get(err); });
    
    }
    @Query("getOneScanPdf")
    @Access(GRANT_TOKEN.FRONT_ACCESS)
    public async getOneScanPdf(@Args("id") id: number): Promise<ScanPdf> {
        return await this._scanPdfSrv.findOneScanPdf(id);
    }

}