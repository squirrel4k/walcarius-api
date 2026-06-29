import { forwardRef, Module } from "@nestjs/common";
// ---- GUARDS ----
import { APP_GUARD } from "@nestjs/core";
import { AccessGuard } from "../../core/guards/access.guard";

// ---- IMPORTS ----
import { TypeOrmModule } from "@nestjs/typeorm";
import { PassportModule } from "@nestjs/passport";
import { CommonModule } from "../common/common.module";
import { MailerModule } from "../mailer/mailer.module";

// ---- ENTITIES ----
import { ScanPdfSql } from "./entities/scan-pdf.entity";
// ---- CONTROLLERS ----
import { ScanPdfController } from "./controllers/scan-pdf.controller";
// ---- LOADERS ----
import { ScanPdfLoader } from "./loaders/scan-pdf.loader";
// ---- SERVICES ----
import { ScanPdfService } from "./services/scan-pdf.service";
// ---- RESOLVERS ----
import { ScanPdfResolver } from "./resolvers/scan-pdf.resolver";
import { PurchaseOrderModule } from "../purchase-orders/purchase-order.module";


@Module({
    imports: [
        PassportModule.register({ defaultStrategy: "jwt" }),
        TypeOrmModule.forFeature([ScanPdfSql]),
        CommonModule,
        MailerModule,
        forwardRef(() => PurchaseOrderModule),
    ],
    controllers: [ScanPdfController],
    providers: [
        { provide: APP_GUARD, useClass: AccessGuard },
        ScanPdfLoader,
        ScanPdfService,
        ScanPdfResolver
    ],
    exports: [
        ScanPdfService
    ]
})
export class ScanPdfModule { }