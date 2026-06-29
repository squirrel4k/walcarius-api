import { Injectable, InternalServerErrorException, NotImplementedException, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { PdfResult, PdfConfiguration } from "../interfaces/pdf.interface";
import { join } from "path";
import * as Ejs from "ejs";
import * as v4 from "uuid/v4";
import { pdfConfig, PDF_TEMPLATE } from "../config/pdf.config";
import { launch, PDFOptions, Browser } from "puppeteer";
import { FooterManager } from "./footer.manager";
import { HeaderManager } from "./header.manager";
import { PDF_UNIT } from "../enums/unit.enum";
import { ErrorUtil } from "../../../core/utils/error.util";
import { ERROR_MESSAGE } from "../../../core/errors/enum/error.enum";
import { writeFileSync } from "fs";

@Injectable()
export class PdfManager implements OnModuleInit, OnModuleDestroy {

    private _config: { [name: string]: PdfConfiguration };
    private _browser: Browser;

    public constructor(
        private readonly _footerMgr: FooterManager,
        private readonly _headerMgr: HeaderManager
    ) {
        this._config = pdfConfig;
    }

    public async onModuleInit(): Promise<void> {
        // Since we NEVER open an external URL, but only use it to render PDFs, it's fine to not use sandboxes
        this._browser = await launch({ args: ["--no-sandbox", "--disable-setuid-sandbox"] });

        // If the browser closes from whichever reason, restart it
        this._browser.on("disconnected", () => this.onModuleInit());
    }

    public async onModuleDestroy(): Promise<void> {
        await this._browser.close();
    }

    /**
     * @description Generate a PDF using Puppeteer using the given template, its related options (set in pdf.config.ts)
     * @author Quentin Wolfs
     * @param {*} data
     * @param {PDF_TEMPLATE} template
     * @param {string} identifier
     * @returns {Promise<PdfResult>}
     * @memberof PdfManager
     */
    public async generatePdf(data: any, template: PDF_TEMPLATE, identifier: string): Promise<PdfResult> {
        // Resolve PDF configuration based on its template
        if (!this._config[template]) { throw new InternalServerErrorException(ERROR_MESSAGE.PDF_CONFIGURATION_NOT_FOUND); }
        const config: PdfConfiguration = this._config[template];

        // Setup fileName and filePath
        const fileName: string = this.getFileName(config, template, identifier);
        const filepath: string = join(process.env.WAL_TMP_FILE_DEST, `${v4()}.pdf`);

        try {
            // Render Ejs page into string
            const rendered = await this.ejsRender({ ...data, serverUrl: process.env.WAL_URL }, config);

            // Get new page from browser
            const page = await this._browser.newPage();

            // Set page content
            await page.setContent(rendered, { waitUntil: ["load", "domcontentloaded", "networkidle0"] });

            // Set css if given
            if (!!config.css && config.css.length > 0) {
                for (const cssConfig of config.css) {
                    if (!!cssConfig.path) { cssConfig.path = join(process.env.WAL_STATIC_FILE_DEST, ...(cssConfig.path.split("/"))); }
                    await page.addStyleTag(cssConfig);
                }
            }

            // Render PDF
            await page.pdf({
                path: filepath,
                ...this.setPdfOptions(config, filepath),
                headerTemplate: this.setHeader(config, data.header),
                footerTemplate: this.setFooter(config, data.footer),
            });

            // Close page and return file
            await page.close();
            return { fileName, path: filepath };
        } catch (err) {
            throw ErrorUtil.get(err);
        }
    }

    /**
     * @description Set Options for Puppeteer based on the template configuration
     * @author Quentin Wolfs
     * @private
     * @param {PdfConfiguration} config
     * @param {string} filepath
     * @returns {PDFOptions}
     * @memberof PdfManager
     */
    private setPdfOptions(config: PdfConfiguration, filepath: string): PDFOptions {
        const options: PDFOptions = {
            path: filepath,
            displayHeaderFooter: !!config.footer || !!config.header,
            printBackground: true,
            scale: !!config.scale ? config.scale : 1.34
        };
        if (!!config.pageDimension.format) { options.format = config.pageDimension.format; }
        if (!!config.pageDimension.height) { options.height = `${config.pageDimension.height}${config.unit}`; }
        if (!!config.pageDimension.width) { options.width = `${config.pageDimension.width}${config.unit}`; }
        if (!!config.pageDimension.orientation) { options.landscape = config.pageDimension.orientation == "landscape"; }
        if (!!config.pageDimension.margin) { options.margin = this.setMarginUnit(config, config.unit); }

        return options;
    }

    /**
     * @description Set the header of the PDF based on the selected header in the configuration.
     * @author Quentin Wolfs
     * @private
     * @param {PdfConfiguration} config
     * @param {*} [data]
     * @throws {NotImplementedException} If the header in configuration isn't implemented
     * @returns {string}
     * @memberof PdfManager
     */
    private setHeader(config: PdfConfiguration, data?: any): string {
        if (!config.header) { return " "; }

        try {
            return this._headerMgr[config.footer.method](config, data);
        } catch (err) {
            throw new NotImplementedException(ERROR_MESSAGE.HEADER_NOT_IMPLEMENTED);
        }
    }

    /**
     * @description Set the fooder of the PDF based on the selected footer in the configuration.
     * @author Quentin Wolfs
     * @private
     * @param {PdfConfiguration} config
     * @param {*} [data]
     * @throws {NotImplementedException} If the footer in configuration isn't implemented
     * @returns {string}
     * @memberof PdfManager
     */
    private setFooter(config: PdfConfiguration, data?: any): string {
        if (!config.footer) { return " "; }

        try {
            return this._footerMgr[config.footer.method](config, data);
        } catch (err) {
            throw new NotImplementedException(ERROR_MESSAGE.FOOTER_NOT_IMPLEMENTED);
        }
    }

    /**
     * @description Get the generated file name, based on configuration and identifier
     * @author Quentin Wolfs
     * @private
     * @param {PdfConfiguration} config
     * @param {PDF_TEMPLATE} template
     * @param {string} identifier
     * @returns {string}
     * @memberof PdfManager
     */
    private getFileName(config: PdfConfiguration, template: PDF_TEMPLATE, identifier: string): string {
        const namePart: string = config.name != null ? config.name : template;
        const identifierPart: string = identifier ? `${namePart.length > 0 ? "_" : ""}${identifier}` : "";
        return `${namePart}${identifierPart}.pdf`;
    }

    /**
     * @description Set the margins for Puppeteer using the selected unit, and adjusting top/bottom margins to include header/footer
     * @author Quentin Wolfs
     * @private
     * @param {PdfConfiguration} config
     * @param {PDF_UNIT} unit
     * @returns {*}
     * @memberof PdfManager
     */
    private setMarginUnit(config: PdfConfiguration, unit: PDF_UNIT): any {
        return {
            top: `${config.pageDimension.margin.top + (config.header ? config.header.height : 0)}${unit}`,
            right: `${config.pageDimension.margin.right}${unit}`,
            bottom: `${config.pageDimension.margin.bottom + (config.footer ? config.footer.height : 0)}${unit}`,
            left: `${config.pageDimension.margin.left}${unit}`
        };
    }

    /**
     * @description Render the EJS template into a stringified html
     * @author Quentin Wolfs
     * @param {*} data
     * @param {PdfConfiguration} config
     * @throws {InternalServerErrorException}
     * @returns {Promise<string>}
     * @memberof PdfManager
     */
    public async ejsRender(data: any, config: PdfConfiguration): Promise<string> {
        try {
            const templatePath: string = join(process.env.WAL_PDF_TEMPLATES_PATH, ...(config.templateUri.split("/")));
            let render: string = null;
            await Ejs.renderFile(templatePath, data, (err, rendered) => {
                if (!err) {
                    render = rendered;
                } else {
                    throw new InternalServerErrorException(err);
                }
            });

            return render;
        } catch (err) {
            throw ErrorUtil.get(err);
        }
    }
}