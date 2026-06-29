import { Module, forwardRef } from "@nestjs/common";

// ---- GUARDS ----
import { APP_GUARD } from "@nestjs/core";
import { AccessGuard } from "../../core/guards/access.guard";

// ---- IMPORTS ----
import { CommonModule } from "../common/common.module";
import { PassportModule } from "@nestjs/passport";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ProjectModule } from "../projects/project.module";
import { UserModule } from "../users/user.module";
import { SupplierModule } from "../suppliers/supplier.module";
import { PriceRequestModule } from "../price-requests/price-request.module";
import { MailerModule } from "../mailer/mailer.module";

// ---- ENTITIES ----
import { PurchaseOrderSql } from "./entities/purchase-order.entity";
import { PurchaseOrderAdditionnalCostSql } from "./entities/purchase-order-additionnal-cost.entity";
import { PurchaseOrderElementSql } from "./entities/purchase-order-element.entity";
import { PurchaseOrderElementOptionSql } from "./entities/purchase-order-element-option.entity";

// ---- LOADERS ----
import { PurchaseOrderLoader } from "./loaders/purchase-order.loader";
import { PurchaseOrderAdditionnalCostLoader } from "./loaders/purchase-order-additionnal-cost.loader";
import { PurchaseOrderACByPurchaseOrderLoader } from "./loaders/purchase-order-additionnal-cost-by-purchase-order.loader";
import { PurchaseOrderElementLoader } from "./loaders/purchase-order-elements.loader";
import { PurchaseOrderElementByPurchaseOrderLoader } from "./loaders/purchase-order-element-by-purchase-order.loader";
import { POElementOptionByPOElementLoader } from "./loaders/purchase-order-element-option-by-purchase-order-element.loader";
import { PurchaseOrderElementOptionLoader } from "./loaders/purchase-order-element-option.loader";
import { PurchaseOrderByProjectLoader } from "./loaders/purchase-order-by-project.loader";
import { TotalPriceByPurchaseOrderLoader } from "./loaders/total-price-by-purchase-order.loader";
import { TotalAdditionnalCostByPurchaseOrderLoader } from "./loaders/total-additionnal-cost-by-purchase-order.loader";

// ---- SERVICES ----
import { PurchaseOrderService } from "./services/purchase-order.service";
import { PurchaseOrderAdditionnalCostService } from "./services/purchase-order-additionnal-cost.service";
import { PurchaseOrderElementService } from "./services/purchase-order-element.service";
import { PurchaseOrderElementOptionService } from "./services/purchase-order-element-option.service";

// ---- RESOLVERS ----
import { PurchaseOrderResolver } from "./resolvers/purchase-order.resolver";
import { PurchaseOrderAdditionnalCostResolver } from "./resolvers/purchase-order-additionnal-cost.resolver";
import { PurchaseOrderElementResolver } from "./resolvers/purchase-order-element.resolver";

// ---- CONTROLLERS ----
import { PurchaseOrderController } from "./controllers/purchase-order.controller";
import { PurchaseOrderElementController } from "./controllers/purchase-order-element.controller";

// ---- MANAGERS ----
import { PurchaseOrderPdfManager } from "./managers/purchase-order-pdf.manager";
import { SmtpConfigService } from "../smtp-config/services/smtp-config.service";
import { AuthModule } from "../auth/auth.module";
import { ScanPdfService } from "../scan-pdf/services/scan-pdf.service";
import { ScanPdfController } from "../scan-pdf/controllers/scan-pdf.controller";
import { ScanPdfLoader } from "../scan-pdf/loaders/scan-pdf.loader";
import { ScanPdfModule } from "../scan-pdf/scan-pdf.module";
import { PurchaseOrderAdmissionLogModule } from "../purchaseOrderAdmissionLog/purchaseOrderAdmissionLog.module";

@Module({
    imports: [
        PassportModule.register({ defaultStrategy: "jwt" }),
        TypeOrmModule.forFeature([PurchaseOrderSql, PurchaseOrderAdditionnalCostSql, PurchaseOrderElementSql, PurchaseOrderElementOptionSql]),
        CommonModule,
        SupplierModule,
        PriceRequestModule,
        AuthModule,
        UserModule,
        MailerModule,
        forwardRef(() => ScanPdfModule),
        forwardRef(() => ProjectModule),
        forwardRef(() => PurchaseOrderAdmissionLogModule)
    ],
    controllers: [
        PurchaseOrderController,
        PurchaseOrderElementController
    ],
    providers: [
        { provide: APP_GUARD, useClass: AccessGuard },
        PurchaseOrderLoader,
        PurchaseOrderService,
        PurchaseOrderResolver,
        SmtpConfigService,
        PurchaseOrderAdditionnalCostLoader,
        PurchaseOrderAdditionnalCostService,
        PurchaseOrderAdditionnalCostResolver,
        PurchaseOrderACByPurchaseOrderLoader,
        PurchaseOrderElementLoader,
        PurchaseOrderElementService,
        PurchaseOrderElementByPurchaseOrderLoader,
        PurchaseOrderElementResolver,
        PurchaseOrderElementOptionLoader,
        POElementOptionByPOElementLoader,
        PurchaseOrderElementOptionService,
        PurchaseOrderPdfManager,
        PurchaseOrderByProjectLoader,
        TotalPriceByPurchaseOrderLoader,
        TotalAdditionnalCostByPurchaseOrderLoader,
    ],
    exports: [
        PurchaseOrderService
    ]
})
export class PurchaseOrderModule { }