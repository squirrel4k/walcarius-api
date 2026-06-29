

import { Module } from "@nestjs/common";
// ---- GUARDS ----
import { APP_GUARD } from "@nestjs/core";
import { AccessGuard } from "../../core/guards/access.guard";

// ---- IMPORTS ----
import { TypeOrmModule } from "@nestjs/typeorm";
import { PassportModule } from "@nestjs/passport";
import { CommonModule } from "../common/common.module";
import { RedisModule } from "nestjs-redis";

// ---- ENTITIES ----
import { SmtpConfigSql } from "./entities/smtp-config.entity";

// ---- LOADERS ----


// ---- SERVICES ----
import { SmtpConfigService } from "./services/smtp-config.service";
import { SmtpConfigLoader } from "./loaders/smtp-config.loader";


// ---- RESOLVERS ----
import { SmtpConfigResolver } from "./resolvers/smtp-config.resolver";
import { AuthModule } from "../auth/auth.module";
import { AuthService } from "../auth/auth.service";

@Module({
    imports: [
        PassportModule.register({ defaultStrategy: "jwt" }),
        TypeOrmModule.forFeature([SmtpConfigSql]),
        RedisModule,
        CommonModule
    ],
    controllers: [],
    providers: [
        { provide: APP_GUARD, useClass: AccessGuard },
        SmtpConfigService,
        SmtpConfigLoader,
        SmtpConfigResolver
    ],
    exports: [
        SmtpConfigService      
    ]
})
export class SmtpConfigModule { }