import { Injectable } from "@nestjs/common";
import { OneToManySqlLoader } from "../../../core/dataloader/sql/otm-sql.loader";
import { Repository, IsNull } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";
import { SupplierOfferElementSql } from "../entities/supplier-offer-element.entity";

@Injectable()
export class SupplierOfferElementByPriceRequestElementLoader extends OneToManySqlLoader<SupplierOfferElementSql> {

    public constructor (
        @InjectRepository(SupplierOfferElementSql) supplierOfferElementRepo: Repository<SupplierOfferElementSql>
    ) {
        super(supplierOfferElementRepo, "supplierOfferElementsByPriceRequestElement", "priceRequestElementId");
    }
}