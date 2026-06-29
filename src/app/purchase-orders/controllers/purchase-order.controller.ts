import { Controller, Get, UseInterceptors, Param, Res } from "@nestjs/common";
import { RestLoggerInterceptor } from "../../common/interceptors/rest-logger.interceptor";
import { PurchaseOrderPdfManager } from "../managers/purchase-order-pdf.manager";
import { Response } from "express";
import { FileUtil } from "../../../core/utils/file.util";

@Controller("/api/purchaseOrders")
@UseInterceptors(RestLoggerInterceptor)
export class PurchaseOrderController {

    public constructor (
        private readonly _purchaseOrderPdfMgr: PurchaseOrderPdfManager
    ) { }

    @Get(":id.pdf")
    public async getPurchaseOrderPdf(@Param("id") purchaseOrderId: number, @Res() res: Response) {
        const pdfResult = await this._purchaseOrderPdfMgr.generatePdf(purchaseOrderId);

        await FileUtil.download(pdfResult.pdf.path, pdfResult.pdf.fileName, res, true);
    }
}

