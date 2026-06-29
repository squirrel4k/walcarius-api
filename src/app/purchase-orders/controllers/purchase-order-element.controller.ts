import { Controller, Get, UseInterceptors, Param, Res, Query, BadRequestException } from "@nestjs/common";
import { RestLoggerInterceptor } from "../../common/interceptors/rest-logger.interceptor";
import { PurchaseOrderPdfManager } from "../managers/purchase-order-pdf.manager";
import { Response } from "express";
import { FileUtil } from "../../../core/utils/file.util";
import { StickerInput } from "../interfaces/purchase-order-element.interface";
import { ERROR_MESSAGE } from "../../../core/errors/enum/error.enum";

@Controller("/api/purchaseOrderElements")
@UseInterceptors(RestLoggerInterceptor)
export class PurchaseOrderElementController {

    public constructor (
        private readonly _purchaseOrderPdfMgr: PurchaseOrderPdfManager
    ) { }

    @Get(":id/sticker.pdf")
    public async getStickerPdf(@Param("id") purchaseOrderElementId: number, @Query("qty") qty: string, @Res() res: Response) {
        const quantity = !isNaN(parseInt(qty, 10)) ? parseInt(qty, 10) : 1;
        const pdfResult = await this._purchaseOrderPdfMgr.generateStickerPdf([{ purchaseOrderElementId, quantity }]);

        await FileUtil.download(pdfResult.pdf.path, pdfResult.pdf.fileName, res, true);
    }

    @Get("stickers.pdf")
    public async getStickersPdf(@Query("elements") elements: string, @Res() res: Response) {

        const input = this.parseInput(elements);
        const pdfResult = await this._purchaseOrderPdfMgr.generateStickerPdf(input);

        await FileUtil.download(pdfResult.pdf.path, pdfResult.pdf.fileName, res, true);
    }

    /**
     * @description Parse elements string into usable StickerInput
     * @author Quentin Wolfs
     * @private
     * @param {string} elements
     * @returns {StickerInput[]}
     * @memberof PurchaseOrderElementController
     */
    private parseInput(elements: string): StickerInput[] {
        if (!/^\[{\d+,\d+}(,{\d+,\d+})*\]$/.test(elements)) { throw new BadRequestException(ERROR_MESSAGE.INVALID_ASKED_STICKER_FORMAT); }
        const tuples = elements.replace(/(\[|\])/g, "").split(/},{?/);

        return tuples.map(tuple => {
            const params = tuple.replace(/({|})/g, "").split(",");
            return {
                purchaseOrderElementId: +params[0],
                quantity: !isNaN(parseInt(params[1], 10)) ? parseInt(params[1], 10) : 1
            };
        });
    }
}