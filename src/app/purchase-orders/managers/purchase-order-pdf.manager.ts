import { Injectable, BadRequestException } from "@nestjs/common";
import { PdfManager } from "../../pdf/managers/pdf.manager";
import { PurchaseOrderElement, ElementStickerData, StickerInput, ElementUnit } from "../interfaces/purchase-order-element.interface";
import { PurchaseOrder } from "../interfaces/purchase-order.interface";
import { PdfResult } from "../../pdf/interfaces/pdf.interface";
import { PurchaseOrderService } from "../services/purchase-order.service";
import { ERROR_MESSAGE } from "../../../core/errors/enum/error.enum";
import { ElementUnitConfig, PdfElementLineType, ElementUnitCategory } from "../../price-requests/interfaces/price-request-element.interface";
import { unitConfig } from "../../price-requests/config/unit.config";
import { DateUtil } from "../../../core/utils/date.util";
import { PurchaseOrderElementService } from "../services/purchase-order-element.service";
import { ErrorUtil } from "../../../core/utils/error.util";
import { TranslationUtil } from "../../../core/utils/translation.util";
import { LANG } from "../../../core/enums/language.enum";
import { PDF_TEMPLATE } from "../../pdf/config/pdf.config";
import { QuantityUnit } from "../../projects/interfaces/supply-list-element.interface";
import { PurchaseOrderAdditionnalCost } from "../interfaces/purchase-order-additionnal-cost.interface";
import { AdditionnalCostType } from "../../price-requests/interfaces/price-request-additionnal-cost.interface";

interface PurchaseOrderPdfResult {
    data: {
        purchaseOrder: PurchaseOrder;
        lang: string;
    };
    pdf: PdfResult;
}

interface PurchaseOrderStickerPdfResult {
    data: ElementStickerData[];
    pdf: PdfResult;
}

@Injectable()
export class PurchaseOrderPdfManager {

    private _unitConfig: ElementUnitConfig;

    public constructor(
        private readonly _purchaseOrderSrv: PurchaseOrderService,
        private readonly _purchaseOrderElementSrv: PurchaseOrderElementService,
        private readonly _pdfMgr: PdfManager
    ) {
        this._unitConfig = unitConfig;
    }

    /**
     * @description Genererate a pdf containing all informations required to order goods to a supplier
     * @author Quentin Wolfs
     * @param {number} purchaseOrderId
     * @memberof PurchaseOrderPdfManager
     */
    public async generatePdf(purchaseOrderId: number): Promise<PurchaseOrderPdfResult> {
        try {
            const purchaseOrder: PurchaseOrder = await this._purchaseOrderSrv.getDataForPurchaseOrderPdf(purchaseOrderId);
            if (!purchaseOrder) { throw new BadRequestException(ERROR_MESSAGE.NO_PURCHASE_ORDER); }

            if (!purchaseOrder.project) {
                purchaseOrder.elements = await this._purchaseOrderElementSrv.completeDataForPurchaseOrderPdf(purchaseOrder.id, purchaseOrder.elements);
            }

            const lang: LANG = purchaseOrder && purchaseOrder.supplierContact ?
                (LANG[purchaseOrder.supplierContact.language] || LANG.FR) : LANG.FR;

            if (!!purchaseOrder.additionnalCosts && purchaseOrder.additionnalCosts.length > 0) {
                purchaseOrder.additionnalCosts = this.sortAdditionnalCosts(purchaseOrder.additionnalCosts, lang);
            }

            const pdfResult = await this._pdfMgr.generatePdf(
                {
                    purchaseOrder, lang, unitConfig: this._unitConfig, displayDate: DateUtil.displayDate, formatLength: this.formatLength,
                    formatUnit: this.formatUnit, formatQuantityUnit: this.formatQuantityUnit, getLineType: this.getLineType,
                    PdfElementLineType, translate: TranslationUtil.translate,
                    footer: { message: `${TranslationUtil.translate("pdf.purchase_order.name", lang)} ${purchaseOrder.reference}`, legend: lang }
                },
                PDF_TEMPLATE.PURCHASE_ORDER,
                purchaseOrder.reference
            );

            return { data: { purchaseOrder, lang }, pdf: pdfResult };
        } catch (e) {
            throw ErrorUtil.get(e);
        }
    }

    /**
     * @description Generate Sticker PDF for asked elements in asked quantity
     * @author Quentin Wolfs
     * @param {StickerInput[]} askedStickers
     * @returns {Promise<PurchaseOrderStickerPdfResult[]>}
     * @memberof PurchaseOrderPdfManager
     */
    public async generateStickerPdf(askedStickers: StickerInput[]): Promise<PurchaseOrderStickerPdfResult> {
        try {
            const stickerDatas: ElementStickerData[] = await this._purchaseOrderElementSrv.getDataForStickerPdf(askedStickers);
            if (stickerDatas.length == 0) { throw new BadRequestException(ERROR_MESSAGE.NO_PURCHASE_ORDER_ELEMENT); }

            const result = {
                data: stickerDatas,
                pdf: await this._pdfMgr.generatePdf(
                    {
                        data: stickerDatas, displayDate: DateUtil.displayDate, formatLength: this.formatLength,
                        formatUnit: this.formatUnit, getLineType: this.getLineType, PdfElementLineType, unitConfig: this._unitConfig
                    },
                    PDF_TEMPLATE.PURCHASE_ORDER_ELEMENT_STICKER,
                    stickerDatas[0].purchaseOrderReference
                )
            };

            await Promise.all(askedStickers.map(async asked => {
                return await this._purchaseOrderElementSrv.updatePrintedStatus(asked.purchaseOrderElementId, asked.quantity);
            })).catch(err => { throw ErrorUtil.get(err); });

            return result;
        } catch (e) {
            throw ErrorUtil.get(e);
        }
    }

    /**
     * @description Formats element's format for PDF display
     * @author Quentin Wolfs
     * @private
     * @param {string} length
     * @returns {string}
     * @memberof PurchaseOrderPdfManager
     */
    private formatLength(length: string): string {
        if (isNaN(+length)) { return length; }

        return `${+length / 1000}m`;
    }

    /**
     * @description Get unit of an element for PDF display
     * @author Quentin Wolfs
     * @private
     * @param {ElementUnitConfig} config
     * @param {PurchaseOrderElement} element
     * @returns {string}
     * @memberof PurchaseOrderPdfManager
     */
    private formatUnit(config: ElementUnitConfig, element: PurchaseOrderElement): string {
        const categoryId = element.supplyCategoryId;
        let cat: string = Object.keys(config.categories).find(key => config.categories[key].includes(categoryId));
        cat = cat ? cat : "default";
        const unit: ElementUnit = cat === "default" && !!element.unit ? element.unit : config.units[cat].element;

        switch (unit) {
            case ElementUnit.EURO: return "€";
            case ElementUnit.EURO_BY_METER: return "€ / m";
            case ElementUnit.EURO_BY_SQUARE_METER: return "€ / m²";
            case ElementUnit.EURO_BY_KG: return "€ / kg";
            case ElementUnit.EURO_BY_TON: return "€ / T";
            case ElementUnit.EURO_BY_UNIT: return "€ / u";
        }
    }

    /**
     * @description Format quantity unit of an element for PDF display
     * @author Quentin Wolfs
     * @private
     * @param {QuantityUnit} unit
     * @param {LANG} lang
     * @returns {string}
     * @memberof PurchaseOrderPdfManager
     */
    private formatQuantityUnit(unit: QuantityUnit, lang: LANG): string {
        switch (unit) {
            case QuantityUnit.UNIT: return TranslationUtil.translate("pdf.purchase_order.piece", lang);
            case QuantityUnit.KG: return "kg";
            case QuantityUnit.TON: return "T";
            default: return unit;
        }
    }

    /**
     * @description Defines the line type for the PDF
     * @author Quentin Wolfs
     * @private
     * @param {ElementUnitConfig} config
     * @param {PurchaseOrderElement} element
     * @returns {PdfElementLineType}
     * @memberof PurchaseOrderPdfManager
     */
    private getLineType(config: ElementUnitConfig, element: PurchaseOrderElement): PdfElementLineType {
        if (config.categories[ElementUnitCategory.BEAMS].includes(element.supplyCategoryId)
         || config.categories[ElementUnitCategory.TUBES].includes(element.supplyCategoryId)) {
            return PdfElementLineType.AMALGAMS;
        } else if (config.categories[ElementUnitCategory.PLATES].includes(element.supplyCategoryId)) {
            return PdfElementLineType.PLATES;
        } else {
            return PdfElementLineType.DEFAULT;
        }
    }

    /**
     * @description Sort additionnal costs by adapted denomination. WARNING : mutates the original array
     * @author Quentin Wolfs
     * @private
     * @param {PurchaseOrderAdditionnalCost[]} additionnalCosts
     * @param {LANG} lang
     * @returns {PurchaseOrderAdditionnalCost[]}
     * @memberof PurchaseOrderPdfManager
     */
    private sortAdditionnalCosts(additionnalCosts: PurchaseOrderAdditionnalCost[], lang: LANG): PurchaseOrderAdditionnalCost[] {
        additionnalCosts.forEach(addCost => {
            const isOtherType = addCost.type === AdditionnalCostType.OTHER;
            addCost["tmpDenomination"] = isOtherType ?
                addCost.denomination :
                TranslationUtil.translate(`pdf.purchase_order.${AdditionnalCostType[addCost.type].toLowerCase()}`, lang);
        });
        return additionnalCosts.sort((a, b) => {
            if (a["tmpDenomination"] > b["tmpDenomination"]) { return 1; }
            if (a["tmpDenomination"] < b["tmpDenomination"]) { return -1; }
            return a.id > b.id ? 1 : -1;
        });
    }
}