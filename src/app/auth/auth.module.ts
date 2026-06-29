import { Module } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { UserModule } from "../users/user.module";
import { JwtStrategy } from "./jwt.strategy";
import { AuthController } from "./auth.controller";
import { AuthResolver } from "./auth.resolver";
import { CommonModule } from "../common/common.module";
import { MailerModule } from "../mailer/mailer.module";
import { APP_GUARD } from "@nestjs/core";
import { AccessGuard } from "../../core/guards/access.guard";
import { SmtpConfigModule } from "../smtp-config/smtp-config.module";
import { PermissionModule } from "../permission/permission.module";

@Module({
    controllers: [
        AuthController
    ],
    imports: [
        CommonModule,
        MailerModule,
        UserModule,
        SmtpConfigModule,
        PermissionModule
    ],
    providers: [
        { provide: APP_GUARD, useClass: AccessGuard },
        AuthService,
        JwtStrategy,
        AuthResolver
    ],
    exports: [
        AuthService
    ]
})
export class AuthModule { }