import { PDF_FOOTER } from "../enums/footer.enum";
import { PDF_HEADER } from "../enums/header.enum";
import { PDF_UNIT } from "../enums/unit.enum";

export interface PdfConfiguration {
    templateUri: string;
    pageDimension: PdfDimension;
    unit: PDF_UNIT;
    css?: PdfCssConfig[];
    scale?: number;
    header?: PdfHeaderConfig;
    footer?: PdfFooterConfig;
    name?: string;
}

export interface PdfDimension {
    format?: "A0" | "A1" | "A2" | "A3" | "A4" | "A5" | "A6" | "Legal" | "Letter" | "Tabloid" | "Ledger";
    orientation?: "portrait" | "landscape";
    margin?: PdfMargin;
    width?: number;
    height?: number;
}

export interface PdfResult {
    fileName: string;
    path: string;
}

export interface PdfMargin {
    top: number;
    right: number;
    bottom: number;
    left: number;
}

export interface PdfCssConfig {
    url?: string;
    path?: string;
    content?: string;
}

export interface PdfHeaderConfig {
    method: PDF_HEADER;
    height: number;
}

export interface PdfFooterConfig {
    method: PDF_FOOTER;
    height: number;
}