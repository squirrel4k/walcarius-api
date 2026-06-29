import { Injectable } from "@nestjs/common";
import { OneToManySqlLoader } from "../../../core/dataloader/sql/otm-sql.loader";
import { VariantOptionSql } from "../entities/variant-option.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

@Injectable()
export class VariantOptionByVariantLoader extends OneToManySqlLoader<VariantOptionSql> {

    public constructor(
        @InjectRepository(VariantOptionSql) variantOptionRepo: Repository<VariantOptionSql>
    ) {
        super(variantOptionRepo, "variantOptionsByVariant", "variantId");
    }
}