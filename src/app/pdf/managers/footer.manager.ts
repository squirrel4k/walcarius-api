import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { PdfConfiguration, PdfMargin } from "../interfaces/pdf.interface";
import { PDF_UNIT } from "../enums/unit.enum";
import { DateUtil } from "../../../core/utils/date.util";

@Injectable()
export class FooterManager {
    /* NOTE :
     * ALL footer methods referenced in "PDF_FOOTER" enum MUST ask for config & data as parameters.
     * If not, unexpected behavior will occur.
     */

    /**
     * @description Set a footer with a message on the left side, and the page count on the right side. WARNING : Requires a field "message" in PdfData.footer
     * @author Quentin Wolfs
     * @param {PdfConfiguration} config
     * @param {*} data
     * @throws {InternalServerException} If no message is found
     * @returns {string}
     * @memberof FooterManager
     */
    public getMessageAndNumFooter(config: PdfConfiguration, data: any): string {
        if (!data || !data.message) { throw new InternalServerErrorException("No message given"); }
        if (data.legend) {
            data.message += data.legend === 'fr' ? 
                `<br>Lexique <small style='font-style: italic;'>KK: tube rectangulaire - K: tube carré - B: tube rond - H: Cornières</small>` :
                `<br>Legende <small style='font-style: italic;'>KK: Rechthoekig koker - K: Vierkant koker - B: ronde buis - H: Hoekijzers</small>`;
        }

        return `${this.getDefaultStyle()}
        <div style='width:100%; ${this.getFooterMargin(config.pageDimension.margin, config.footer.height, config.unit)};'>
            <div style="float:right;">
                Page : <span class="pageNumber"></span> / <span class="totalPages"></span>
            </div>
            <div>${data.message}</div>
        </div>`;
    }

    /**
     * @description Set a footer with the date on the left side, and the page count on the right side
     * @author Quentin Wolfs
     * @param {PdfConfiguration} config
     * @param {*} data
     * @returns {string}
     * @memberof FooterManager
     */
    public getDateAndNumPageFooter(config: PdfConfiguration, data: any): string {
        return `${this.getDefaultStyle()}
        <div style='width:100%; ${this.getFooterMargin(config.pageDimension.margin, config.footer.height, config.unit)};'>
            <div style="float:right;">
                Page : <span class="pageNumber"></span> / <span class="totalPages"></span>
            </div>
            <div>Printed on ${DateUtil.displayDate(new Date(), "DD/MM/YYYY at hh:mm")}</div>
        </div>`;
    }

    /**
     * @description Set a footer with only the page count on the right side
     * @author Quentin Wolfs
     * @param {PdfConfiguration} config
     * @param {*} data
     * @returns {string}
     * @memberof FooterManager
     */
    public getNumPageFooter(config: PdfConfiguration, data: any): string {
        return `${this.getDefaultStyle()}
        <div style='width:100%; ${this.getFooterMargin(config.pageDimension.margin, config.footer.height, config.unit)};'>
            <div style="float:right;">
                Page : <span class="pageNumber"></span> / <span class="totalPages"></span>
            </div>
        </div>`;
    }

    /**
     * @description Retuns the default style used for all footers
     * @author Quentin Wolfs
     * @private
     * @returns {string}
     * @memberof FooterManager
     */
    private getDefaultStyle(): string {
        return "<style>#footer { padding: 0 !important; font-size: 8px; -webkit-print-color-adjust: exact;"
            + "font-family:Roboto, Helvetica Neue, sans-serif; }</style>";
    }

    /**
     * @description Returns the used margin for the footer depending on page dimensions
     * @author Quentin Wolfs
     * @private
     * @param {PdfMargin} pdfMargin
     * @param {number} footerHeight
     * @param {PDF_UNIT} unit
     * @returns {string}
     * @memberof FooterManager
     */
    private getFooterMargin(pdfMargin: PdfMargin, footerHeight: number, unit: PDF_UNIT): string {
        return !!pdfMargin ? `margin: 0 ${pdfMargin.right}${unit} ${footerHeight}${unit} ${pdfMargin.left}${unit}` : "";
    }
}