import { Injectable, BadRequestException } from "@nestjs/common";
import { SupplierOfferService } from "../services/supplier-offer.service";
import { PriceRequestElementService } from "../services/price-request-element.service";
import { PdfManager } from "../../pdf/managers/pdf.manager";
import { PdfResult } from "../../pdf/interfaces/pdf.interface";
import { ERROR_MESSAGE } from "../../../core/errors/enum/error.enum";
import { SupplierOffer } from "../interfaces/supplier-offer.interface";
import { PriceRequestElement, ElementUnitConfig, PdfElementLineType, ElementUnitCategory } from "../interfaces/price-request-element.interface";
import { unitConfig } from "../config/unit.config";
import { ErrorUtil } from "../../../core/utils/error.util";
import { PriceRequestService } from "../services/price-request.service";
import { PriceRequest } from "../interfaces/price-request.interface";
import { LANG } from "../../../core/enums/language.enum";
import { TranslationUtil } from "../../../core/utils/translation.util";
import { PDF_TEMPLATE } from "../../pdf/config/pdf.config";
import { ElementUnit } from "../../purchase-orders/interfaces/purchase-order-element.interface";
import { QuantityUnit } from "../../projects/interfaces/supply-list-element.interface";
import { DateUtil } from "../../../core/utils/date.util";

// tslint:disable-next-line:interface-over-type-literal
type PriceRequestPdfResult = {
    data: {
        elements: PriceRequestElement[];
        supplierOffer: SupplierOffer;
        lang: string;
    };
    pdf: PdfResult;
};

@Injectable()
export class PriceRequestPdfManager {

    private _unitConfig: ElementUnitConfig;

    public constructor (
        private readonly _supplierOfferSrv: SupplierOfferService,
        private readonly _priceRequestElementSrv: PriceRequestElementService,
        private readonly _priceRequestSrv: PriceRequestService,
        private readonly _pdfMgr: PdfManager
    ) {
        this._unitConfig = unitConfig;
    }

    /**
     * @description Genererate a pdf containing all informations required to request prices from a supplier
     * @author Quentin Wolfs
     * @param {number} supplierOfferId
     * @memberof PriceRequestPdfManager
     */
    public async generatePdf(supplierOfferId: number): Promise<PriceRequestPdfResult> {
        try {
            const supplierOffer: SupplierOffer = await this._supplierOfferSrv.getDataForSupplierPdf(supplierOfferId);
            if (!supplierOffer) { throw new BadRequestException(ERROR_MESSAGE.NO_SUPPLIER_OFFER); }

            const elements: PriceRequestElement[] = await this._priceRequestElementSrv.getDataForSupplierPdf(supplierOfferId);
            const lang: LANG = supplierOffer && supplierOffer.supplierContact ?
                (LANG[supplierOffer.supplierContact.language] || LANG.FR) : LANG.FR;

            const pdfResult = await this._pdfMgr.generatePdf(
                {
                    elements, supplierOffer, lang, unitConfig: this._unitConfig, displayDate: DateUtil.displayDate,
                    formatLength: this.formatLength, formatUnit: this.formatUnit, formatQuantityUnit: this.formatQuantityUnit, getLineType: this.getLineType,
                    translate: TranslationUtil.translate, PdfElementLineType,
                    footer: { message: `${TranslationUtil.translate("pdf.price_request.name", lang)} ${supplierOffer.reference}`, legend: lang }
                },
                PDF_TEMPLATE.PRICE_REQUEST,
                supplierOffer.reference
            );

            return { data: { elements, supplierOffer, lang }, pdf: pdfResult };
        } catch (e) {
            throw ErrorUtil.get(e);
        }
    }

    /**
     * @description Generate a pdf containing all informations required to use a barset
     * @author Quentin Wolfs
     * @param {number} priceRequestId
     * @returns {Promise<PdfResult>}
     * @memberof PriceRequestPdfManager
     */
    public async generateAmalgamResumePdf(priceRequestId: number): Promise<PdfResult> {
        try {
            const priceRequest: PriceRequest = await this._priceRequestSrv.getBarsetResumeData(priceRequestId);

            return await this._pdfMgr.generatePdf(
                { priceRequest, formatLength: this.formatLength, footer: { message: `Mise en barre ${priceRequest.reference}` } },
                PDF_TEMPLATE.BARSET_RESUME,
                priceRequestId.toString()
            );
        } catch (e) {
            throw ErrorUtil.get(e);
        }
    }

    /**
     * @description Formats amalgam's length for PDF display
     * @author Quentin Wolfs
     * @private
     * @param {string} length
     * @returns {string}
     * @memberof PriceRequestPdfManager
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
     * @param {PriceRequestElement} element
     * @returns {string}
     * @memberof PriceRequestPdfManager
     */
    private formatUnit(config: ElementUnitConfig, element: PriceRequestElement): string {
        const categoryId = element.amalgamGroup ? element.amalgamGroup.supplyCategoryId : element.supplyListElement.supplyCategoryId;
        let cat: string = Object.keys(config.categories).find(key => config.categories[key].includes(categoryId));
        cat = cat ? cat : "default";
        const unit: ElementUnit = config.units[cat].element;

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
     * @param {string} unit
     * @param {LANG} lang
     * @returns {string}
     * @memberof PriceRequestPdfManager
     */
    private formatQuantityUnit(unit: string, lang: LANG): string {
        switch (unit) {
            case QuantityUnit.UNIT: return TranslationUtil.translate("pdf.price_request.piece", lang);
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
     * @param {PriceRequestElement} element
     * @returns {PdfElementLineType}
     * @memberof PriceRequestPdfManager
     */
    private getLineType(config: ElementUnitConfig, element: PriceRequestElement): PdfElementLineType {
        if (!!element.amalgamGroupId) {
            return PdfElementLineType.AMALGAMS;
        } else {
            if (config.categories[ElementUnitCategory.PLATES].includes(element.supplyListElement.supplyCategoryId)) {
                return PdfElementLineType.PLATES;
            } else {
                return PdfElementLineType.DEFAULT;
            }
        }
    }
}