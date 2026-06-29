import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { ManyToOneSqlLoader } from "../../../core/dataloader/sql/mto-sql.loader";
import { SmtpConfigSql } from "../entities/smtp-config.entity";

@Injectable()
export class SmtpConfigLoader extends ManyToOneSqlLoader<SmtpConfigSql> {

    public constructor(
        @InjectRepository(SmtpConfigSql) smtpRepo: Repository<SmtpConfigSql>
    ) {
        super(smtpRepo, "smtp");
    }
}