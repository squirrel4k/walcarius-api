import { Controller, Get, UseInterceptors, Param, Res, Query } from "@nestjs/common";
import { QuoteService } from "../services/quote.service";
import { RestLoggerInterceptor } from "../../common/interceptors/rest-logger.interceptor";
import { Response } from "express";
import { PdfManager } from "../../pdf/managers/pdf.manager";
import "../../../core/ext/date";
import { FileUtil } from "../../../core/utils/file.util";
import { v4 } from "uuid";
import { ErrorUtil } from "../../../core/utils/error.util";
import { PDF_TEMPLATE } from "../../pdf/config/pdf.config";
import { TranslationUtil } from "../../../core/utils/translation.util";

@Controller("api/quotes")
@UseInterceptors(RestLoggerInterceptor)
export class QuoteController {

    public constructor (
        private readonly _quoteSrv: QuoteService,
        private readonly _pdfMgr: PdfManager
    ) { }

    @Get(":id.pdf")
    public async generateQuotePdf(@Param("id") id: string, @Query("lang") lang: string, @Res() res: Response) {
        try {
            lang = this.getLang(lang);
            const data = await this._quoteSrv.getById(id, v4());
            const pdf = await this._pdfMgr.generatePdf(
                { quote: data, lang, formatDate: Date.prototype.formatDate, formatRemarks: this.formatRemarks, translate: TranslationUtil.translate },
                PDF_TEMPLATE.QUOTE,
                id
            );

            await FileUtil.download(pdf.path, pdf.fileName, res, true);
        } catch (e) {
            throw ErrorUtil.get(e);
        }
    }

    @Get(":id/resume.pdf")
    public async generateWorkResumePdf(@Param("id") id: string, @Res() res: Response) {
        try {
            const data = await this._quoteSrv.getWorkResumeData(id, v4());
            const pdf = await this._pdfMgr.generatePdf(
                { quote: data.quote, data: data.resume, translate: this.translateKey },
                PDF_TEMPLATE.WORK_RESUME,
                id
            );

            await FileUtil.download(pdf.path, pdf.fileName, res, true);
        } catch (e) {
            throw ErrorUtil.get(e);
        }
    }

    /**
     * @description (Not that) temporary function to format line retuns to <br/> for HTML conversion
     * @author Quentin Wolfs
     * @private
     * @param {string} remarks
     * @returns
     * @memberof QuoteController
     */
    private formatRemarks(remarks: string) {
        return remarks.replace(/\n/g, "<br/>");
    }

    /**
     * @description Get the correct language to be used
     * @author Quentin Wolfs
     * @private
     * @param {string} lang
     * @returns {string}
     * @memberof QuoteController
     */
    private getLang(lang: string): string {
        const authorizedLang = ["fr", "nl"];
        return lang && authorizedLang.indexOf(lang) != -1 ? lang : "fr";
    }

    /**
     * @description Translate key from resume object for the pdf display
     * @author Quentin Wolfs
     * @private
     * @param {string} key
     * @returns {string}
     * @memberof QuoteController
     */
    private translateKey(key: string): string {
        const dictionnary = {
            // Operations
            Cutting: "Sciage",
            Drilling: "Perçage",
            LaserDrilling: "Perçage laser",
            Folding: "Pliage",
            LaserCutting: "Découpe laser",
            Bending: "Cintrage",
            // Assemblages
            Welding: "Soudure",
            // Finitions
            Galvanization: "Galvanisation",
            Lacquering: "Laquage au four",
            Metallization: "Métallisation",
            Painting: "Peinture",
            Sandblasting: "Sablage",
            // Options
            Crane: "Grue",
            Montage: "Montage",
            Nacelle: "Nacelle",
            Study: "Étude",
            Transport: "Transport"
        };

        return dictionnary[key] ? dictionnary[key] : "";
    }
}