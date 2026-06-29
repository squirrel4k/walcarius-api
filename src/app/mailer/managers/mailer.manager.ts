import * as Nodemailer from "nodemailer";
import * as path from "path";
import * as EmailTemplate from "email-templates";
import { Injectable } from "@nestjs/common";
import { MailOptions, MailAttachment } from "../interfaces/mailer.interface";
import { MAIL_TEMPLATES } from "../enums/templates.enum";
import { WinstonLogger } from "../../common/logger/winston.logger";
import { ErrorUtil } from "../../../core/utils/error.util";
import { SmtpConfigService } from "../../smtp-config/services/smtp-config.service";
import { Repository } from "typeorm";
import { SmtpConfigSql } from "../../smtp-config/entities/smtp-config.entity";
import { InjectRepository } from "@nestjs/typeorm";
const { decrypt } = require('../../../../assets/encryption.js');

@Injectable()
export class MailerManager {

    private _email: EmailTemplate;
    private _templatesPath: string;

    public constructor(
    ) {
        this._initEmail();
    }

    private _initEmail(smtpConfig?: SmtpConfigSql): void {
        // find smtpconfig active true
        if (smtpConfig) {
            this._email = this._getEmailTemplate(smtpConfig);
        } else {
            this._email = this._getEmailTemplate();
        }
        this._templatesPath = process.env.WAL_MAILER_TEMPLATES_PATH;
    }

    private _getEmailTemplate(smtpConfig?: SmtpConfigSql): EmailTemplate {
        const host = smtpConfig && smtpConfig.host ? smtpConfig.host : process.env.WAL_MAILER_HOST; 
        const port = smtpConfig && smtpConfig.port ? smtpConfig.port : process.env.WAL_MAILER_PORT; 
        const username = smtpConfig && smtpConfig.username ? smtpConfig.username : process.env.WAL_MAILER_USER; 
        const email = smtpConfig && smtpConfig.email ? smtpConfig.email : process.env.WAL_MAILER_EMAIL; 
        const password = smtpConfig && smtpConfig.password ? decrypt(smtpConfig.password) : process.env.WAL_MAILER_PASSWORD;
         
        return new EmailTemplate({
            send: process.env.WAL_MAILER_SEND && process.env.WAL_MAILER_SEND == "true",
            message: {
                from: email
            },
            transport: Nodemailer.createTransport({
                host: host,
                secure: false,
                port: parseInt(port as string, 10) as any,
                auth: {
                    user: username,
                    pass: password
                }
            }),
            views: {
                options: {
                    extension: "ejs"
                }
            }
        });
    }

    /**
     * @description Send a mail given Options, a pre-defined template, and content
     * @author Quentin Wolfs
     * @param {MailOptions} mailOptions
     * @param {MAIL_TEMPLATES} template
     * @param {*} data
     * @param {MailAttachment[]} [attachments]
     * @returns {Promise<boolean>}
     * @memberof MailerManager
     */
    public async send(mailOptions: MailOptions, template: MAIL_TEMPLATES, data: any, attachments?: MailAttachment[], smtpConfig?: SmtpConfigSql): Promise<boolean> {
        if (process.env.WAL_MAILER_FILTER) {
            let override = true;
            process.env.WAL_MAILER_FILTER.split('|').forEach((search) => {
                if (mailOptions.to.indexOf(search) > -1) {
                    override = false;
                }
            })
            if (override) {
                mailOptions.to = process.env.WAL_MAILER_FILTER.split('|')[0];
            }
        }
        if (smtpConfig) {
            this._initEmail(smtpConfig);
        }
        try {
            await this._email.send({
                template: path.join(this._templatesPath, template.toString()),
                message: {
                    to: mailOptions.to,
                    attachments
                },
                locals: data
            });
            if (smtpConfig) {
                this._initEmail();
            }
    
            return true;
        } catch (e) {
            console.log(e);
            throw ErrorUtil.get(e);
        }
    }
}