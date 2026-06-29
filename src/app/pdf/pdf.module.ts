import { Module } from "@nestjs/common";
// ---- IMPORTS ----
import { CommonModule } from "../common/common.module";

// ---- MANAGERS ----
import { PdfManager } from "./managers/pdf.manager";
import { FooterManager } from "./managers/footer.manager";
import { HeaderManager } from "./managers/header.manager";

@Module({
    imports: [
        CommonModule
    ],
    providers: [
        PdfManager,
        FooterManager,
        HeaderManager
    ],
    exports: [
        PdfManager
    ]
})
export class PdfModule { }