import { ManyToOneSqlLoader } from "../../../core/dataloader/sql/mto-sql.loader";
import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { VariantSql } from "../entities/variant.entity";

@Injectable()
export class VariantLoader extends ManyToOneSqlLoader<VariantSql> {

    public constructor (
        @InjectRepository(VariantSql) variantRepo: Repository<VariantSql>
    ) {
        super(variantRepo, "variants");
    }
}