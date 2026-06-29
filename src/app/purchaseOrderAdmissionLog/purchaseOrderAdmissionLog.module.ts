import { Module } from "@nestjs/common";
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
import { PurchaseOrderAdmissionLogSql } from "./entities/purchaseOrderAdmissionLog.entity";

// ---- LOADERS ----
import { PurchaseOrderAdmissionLogLoader } from "./loaders/purchaseOrderAdmissionLog.loader";

// ---- SERVICES ----
import { PurchaseOrderAdmissionLogService } from "./services/purchaseOrderAdmissionLog.service";
// ---- RESOLVERS ----
import { PurchaseOrderAdmissionLogResolver } from "./resolvers/purchaseOrderAdmissionLog.resolver";

@Module({
    imports: [
        PassportModule.register({ defaultStrategy: "jwt" }),
        TypeOrmModule.forFeature([PurchaseOrderAdmissionLogSql]),
        RedisModule,
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