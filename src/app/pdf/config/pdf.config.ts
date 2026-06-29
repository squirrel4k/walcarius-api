import { PdfConfiguration } from "../interfaces/pdf.interface";
import { PDF_UNIT } from "../enums/unit.enum";
import { PDF_FOOTER } from "../enums/footer.enum";

export enum PDF_TEMPLATE {
    QUOTE = "quote",
    WORK_RESUME = "work_resume",
    PRICE_REQUEST = "price_request",
    BARSET_RESUME = "barset_resume",
    PURCHASE_ORDER = "purchase_order",
    PURCHASE_ORDER_ELEMENT_STICKER = "purchase_order_element_sticker"
}

export const pdfConfig: { [name: string]: PdfConfiguration } = {
    quote: {
        templateUri: "quotes/quote.template.html",
        pageDimension: {
            format: "A4",
            orientation: "portrait",
            margin: {
                top: 0.5,
                right: 0.5,
                bottom: 0.5,
                left: 0.5
            }
        },
        unit: PDF_UNIT.CM,
        footer: {
            method: PDF_FOOTER.NUM,
            height: 0.3
        }
    },
    work_resume: {
        templateUri: "quotes/work_resume.template.html",
        pageDimension: {
            format: "A4",
            orientation: "portrait",
            margin: {
                top: 0.5,
                right: 0.5,
                bottom: 0.5,
                left: 0.5
            }
        },
        unit: PDF_UNIT.CM,
        footer: {
            method: PDF_FOOTER.DATE_AND_NUM,
            height: 0.5
        }
    },
    price_request: {
        templateUri: "price-requests/price_request.template.html",
        pageDimension: {
            format: "A4",
            orientation: "portrait",
            margin: {
                top: 0.5,
                right: 0.5,
                bottom: 0.8,
                left: 0.5
            }
        },
        unit: PDF_UNIT.CM,
        footer: {
            method: PDF_FOOTER.MESSAGE_AND_NUM,
            height: 0.5
        },
        name: ""
    },
    barset_resume: {
        templateUri: "price-requests/barset_resume.template.html",
        pageDimension: {
            format: "A4",
            orientation: "portrait",
            margin: {
                top: 0.5,
                right: 0.5,
                bottom: 0.7,
                left: 0.5
            }
        },
        unit: PDF_UNIT.CM,
        footer: {
            method: PDF_FOOTER.MESSAGE_AND_NUM,
            height: 0.5
        }
    },
    purchase_order: {
        templateUri: "purchase-orders/purchase_order.template.html",
        pageDimension: {
            format: "A4",
            orientation: "portrait",
            margin: {
                top: 0.5,
                right: 0.5,
                bottom: 0.8,
                left: 0.5
            }
        },
        unit: PDF_UNIT.CM,
        footer: {
            method: PDF_FOOTER.MESSAGE_AND_NUM,
            height: 0.5
        },
        name: ""
    },
    purchase_order_element_sticker: {
        templateUri: "purchase-orders/purchase_order_element_sticker.template.html",
        pageDimension: {
            width: 100,
            height: 52
        },
        unit: PDF_UNIT.MM,
        name: "stickers"
    },
};