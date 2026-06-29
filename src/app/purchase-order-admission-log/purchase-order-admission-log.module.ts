import { Module } from "@nestjs/common";
// ---- GUARDS ----
import { APP_GUARD } from "@nestjs/core";
import { AccessGuard } from "../../core/guards/access.guard";

// ---- IMPORTS ----
import { TypeOrmModule } from "@nestjs/typeorm";
import { PassportModule } from "@nestjs/passport";
import { CommonModule } from "../common/common.module";
import { MailerModule } from "../mailer/mailer.module";

// ---- ENTITIES ----
import { PurchaseOrderAdmissionLogSql } from "./entities/purchase-order-admission-log.entity";

// ---- LOADERS ----
import { PurchaseOrderAdmissionLogLoader } from "./loaders/purchase-order-admission-log.loader";

// ---- SERVICES ----
import { PurchaseOrderAdmissionLogService } from "./services/purchase-order-admission-log.service";
// ---- RESOLVERS ----
import { PurchaseOrderAdmissionLogResolver } from "./resolvers/purchase-order-admission-log.resolver";

@Module({
    imports: [
        PassportModule.register({ defaultStrategy: "jwt" }),
        TypeOrmModule.forFeature([PurchaseOrderAdmissionLogSql]),
        CommonModule,
        MailerModule,
    
    ],
    controllers: [],
    providers: [
        { provide: APP_GUARD, useClass: AccessGuard },
        PurchaseOrderAdmissionLogService,
        PurchaseOrderAdmissionLogLoader,
        PurchaseOrderAdmissionLogResolver
    ],
    exports: [
        PurchaseOrderAdmissionLogService
    ]
})
export class PurchaseOrderAdmissionLogModule { }