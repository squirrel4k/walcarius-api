import { Module } from "@nestjs/common";
// ---- GUARDS ----
import { APP_GUARD } from "@nestjs/core";
import { AccessGuard } from "../../core/guards/access.guard";

// ---- IMPORTS ----
import { TypeOrmModule } from "@nestjs/typeorm";
import { PassportModule } from "@nestjs/passport";
import { CommonModule } from "../common/common.module";
import { MailerModule } from "../mailer/mailer.module";
import { SmtpConfigModule } from "../smtp-config/smtp-config.module";

// ---- ENTITIES ----
import { UserSql } from "./entities/user.entity";
import { UserHistorySql } from "./entities/userhistory.entity";
import { SmtpConfigSql } from "../smtp-config/entities/smtp-config.entity";

// ---- LOADERS ----
import { UserLoader } from "./loaders/user.loader";

// ---- SERVICES ----
import { UserService } from "./services/user.service";
import { UserHistoryService } from "./services/userhistory.service";

// ---- RESOLVERS ----
import { UserResolver } from "./resolvers/user.resolver";
import { AuthModule } from "../auth/auth.module";
import { AuthService } from "../auth/auth.service";
import { PermissionService } from "../permission/services/permission.service";
import { PermissionModule } from "../permission/permission.module";

@Module({
    imports: [
        PassportModule.register({ defaultStrategy: "jwt" }),
        TypeOrmModule.forFeature([UserSql, UserHistorySql, SmtpConfigSql]),
        CommonModule,
        MailerModule,
        PermissionModule,
        SmtpConfigModule
    
    ],
    controllers: [],
    providers: [
        { provide: APP_GUARD, useClass: AccessGuard },
        UserService,
        UserLoader,
        UserHistoryService,
        UserResolver,
        AuthService
    ],
    exports: [
        UserService,
        UserHistoryService
    ]
})
export class UserModule { }