import { Injectable } from "@nestjs/common";
import { ManyToOneSqlLoader } from "../../../core/dataloader/sql/mto-sql.loader";
import { VariantOptionSql } from "../entities/variant-option.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

@Injectable()
export class VariantOptionLoader extends ManyToOneSqlLoader<VariantOptionSql> {

    public constructor(
        @InjectRepository(VariantOptionSql) variantOptionRepo: Repository<VariantOptionSql>
    ) {
        super(variantOptionRepo, "variantOptions");
    }
}