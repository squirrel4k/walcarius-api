import { Controller, Get, Param, Res, UseInterceptors } from "@nestjs/common";
import { FileUtil } from "../../../core/utils/file.util";
import { Response } from "express";
import { PriceRequestPdfManager } from "../managers/price-request-pdf.manager";
import { RestLoggerInterceptor } from "../../common/interceptors/rest-logger.interceptor";

@Controller("api/priceRequests")
@UseInterceptors(RestLoggerInterceptor)
export class PriceRequestController {

    public constructor(
        private readonly _priceRequestPdfMgr: PriceRequestPdfManager
    ) { }

    @Get("offer/:supplierOfferId.pdf")
    public async generatePriceRequestPdf(@Param("supplierOfferId") supplierOfferId: number, @Res() res: Response) {
        const pdfResult = await this._priceRequestPdfMgr.generatePdf(supplierOfferId);

        await FileUtil.download(pdfResult.pdf.path, pdfResult.pdf.fileName, res, true);
    }

    @Get(":id/barset.pdf")
    public async generateBarsetResumePdf(@Param("id") priceRequestId: number, @Res() res: Response) {
        const pdfResult = await this._priceRequestPdfMgr.generateAmalgamResumePdf(priceRequestId);

        await FileUtil.download(pdfResult.path, pdfResult.fileName, res, true);
    }
}