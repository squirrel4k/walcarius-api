import { Injectable } from "@nestjs/common";
import { OneToManySqlLoader } from "../../../core/dataloader/sql/otm-sql.loader";
import { InjectRepository } from "@nestjs/typeorm";
import { SupplierOfferElementOptionSql } from "../entities/supplier-offer-element-option.entity";
import { Repository } from "typeorm";

@Injectable()
export class SOEOptionByPREOptionLoader extends OneToManySqlLoader<SupplierOfferElementOptionSql> {

    public constructor(
        @InjectRepository(SupplierOfferElementOptionSql) supplierOfferElementOptionRepo: Repository<SupplierOfferElementOptionSql>
    ) {
        super(supplierOfferElementOptionRepo, "SOEOptionsByPREOption", "priceRequestElementOptionId");
    }
}