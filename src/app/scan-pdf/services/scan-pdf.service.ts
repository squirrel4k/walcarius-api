import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { BaseSqlService } from "../../../core/services/base-sql.service";
import { ErrorUtil } from "../../../core/utils/error.util";
import { Repository } from "typeorm";
import { ScanPdfSql } from "../entities/scan-pdf.entity";
import { InputScanPdf, ScanPdf, ScanPdfUpdate } from "../interfaces/scan-pdf.interface";
import { ScanPdfLoader } from "../loaders/scan-pdf.loader";


@Injectable()
export class ScanPdfService extends BaseSqlService<ScanPdfSql, InputScanPdf, ScanPdfUpdate>{

    constructor(
        @InjectRepository(ScanPdfSql) private readonly  _scanPdfRepo: Repository<ScanPdfSql>,
        private readonly _scanPdfLoader: ScanPdfLoader,
    ) { 
        super(_scanPdfRepo, _scanPdfLoader, ScanPdfSql, true);
    }

    /**
    * @description add ScanPdf purchaseOrder 
    * @author Marie Claudia
    * @param {ScanPdf} 
    * @returns {Promise<ScanPdfSql>}
    * @memberof ScanPdfService
    */
    public async addScanPdf(data: ScanPdf): Promise<ScanPdf> {
        try {
            const element = await this._scanPdfRepo.save(data);
            return element;
        } catch (e) {
            throw ErrorUtil.get(e);
        }
    }

    /**
     *  @description Find a scanpdf by properties
     *  @author Marie Claudia
     *  @param {ScanPdf} scanPdfProperties
     *  @returns
     *  @memberof ScanPdfService
     */
    public async findByProperty(scanPdfProperties: ScanPdf): Promise<ScanPdfSql[]> {
        try {
            return this._scanPdfRepo.find({ where: scanPdfProperties });
        } catch (e) {
            throw ErrorUtil.get(e);
        }
    }

    /**
     *  @description Find a scanpdf by properties
     *  @author Raphaël Michaux
     *  @param {ScanPdf} scanPdfProperties
     *  @returns
     *  @memberof ScanPdfService
     */
    public async findByUrl(url: string): Promise<ScanPdfSql> {
        try {
            // return this._scanPdfRepo.findOne({ where: {url: url} });
            return this._scanPdfRepo
                .createQueryBuilder('s')
                .leftJoinAndSelect('s.purchaseOrder', 'sp')
                .where("s.url = :url", {url: url})
                .getOne()
        } catch (e) {
            throw ErrorUtil.get(e);
        }
    }

    /**
     *  @description Find a scanpdf by properties
     *  @author Setra Johariniaina
     *  @param {ScanPdf} id
     *  @returns
     *  @memberof ScanPdfService
     */
    public async findOneScanPdf(id: number) {
        try {
            let scan =  await this._scanPdfRepo.findOne(id);
            return scan;
        } catch (e) {
            throw ErrorUtil.get(e);
        }
    }
    
}
