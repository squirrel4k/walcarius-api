import { Module } from "@nestjs/common";
import { MailerManager } from "./managers/mailer.manager";
import { CommonModule } from "../common/common.module";
import { SmtpConfigService } from "../smtp-config/services/smtp-config.service";
import { SmtpConfigModule } from "../smtp-config/smtp-config.module";

@Module({
    providers: [
        MailerManager
    ],
    imports: [
        CommonModule,
        SmtpConfigModule
    ],
    exports: [
        MailerManager
    ]
})
export class MailerModule { }