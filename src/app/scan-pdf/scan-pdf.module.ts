import { forwardRef, Module } from "@nestjs/common";
// ---- GUARDS ----
import { APP_GUARD } from "@nestjs/core";
import { AccessGuard } from "../../core/guards/access.guard";

// ---- IMPORTS ----
import { TypeOrmModule } from "@nestjs/typeorm";
import { PassportModule } from "@nestjs/passport";
import { CommonModule } from "../common/common.module";
import { RedisModule } from "nestjs-redis";
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
import { PurchaseOrderService } from "../purchase-orders/services/purchase-order.service";
import { PurchaseOrderLoader } from "../purchase-orders/loaders/purchase-order.loader";
import { PurchaseOrderByProjectLoader } from "../purchase-orders/loaders/purchase-order-by-project.loader";
import { TotalPriceByPurchaseOrderLoader } from "../purchase-orders/loaders/total-price-by-purchase-order.loader";
import { TotalAdditionnalCostByPurchaseOrderLoader } from "../purchase-orders/loaders/total-additionnal-cost-by-purchase-order.loader";
import { MailerManager } from "../mailer/managers/mailer.manager";
import { WinstonLogger } from "../common/logger/winston.logger";
import { PriceCalculatorManager } from "../price-requests/managers/price-calculator.manager";
import { PurchaseOrderModule } from "../purchase-orders/purchase-order.module";


@Module({
    imports: [
        PassportModule.register({ defaultStrategy: "jwt" }),
        TypeOrmModule.forFeature([ScanPdfSql]),
        RedisModule,
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