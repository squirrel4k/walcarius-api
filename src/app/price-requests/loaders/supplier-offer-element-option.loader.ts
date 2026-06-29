import { ManyToOneSqlLoader } from "../../../core/dataloader/sql/mto-sql.loader";
import { SupplierOfferElementOptionSql } from "../entities/supplier-offer-element-option.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

export class SupplierOfferElementOptionLoader extends ManyToOneSqlLoader<SupplierOfferElementOptionSql> {

    public constructor(
        @InjectRepository(SupplierOfferElementOptionSql) supplierOfferElementOptionRepo: Repository<SupplierOfferElementOptionSql>
    ) {
        super(supplierOfferElementOptionRepo, "supplierOfferElementOptions");
    }
}