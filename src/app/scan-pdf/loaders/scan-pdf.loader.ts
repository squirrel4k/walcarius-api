import { ManyToOneSqlLoader } from "../../../core/dataloader/sql/mto-sql.loader";
import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { ScanPdfSql } from "../entities/scan-pdf.entity";

@Injectable()
export class ScanPdfLoader extends ManyToOneSqlLoader<ScanPdfSql> {

    public constructor(
        @InjectRepository(ScanPdfSql) scanPdfRepo: Repository<ScanPdfSql>
    ) {
        super(scanPdfRepo, "scanPdf");
    }
}
