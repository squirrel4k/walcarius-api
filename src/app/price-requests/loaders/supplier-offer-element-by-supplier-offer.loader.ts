import { Injectable } from "@nestjs/common";
import { SupplierOfferElementSql } from "../entities/supplier-offer-element.entity";
import { Repository, IsNull } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";
import { OneToManySqlLoader } from "../../../core/dataloader/sql/otm-sql.loader";

@Injectable()
export class SupplierOfferElementBySupplierOfferLoader extends OneToManySqlLoader<SupplierOfferElementSql> {

    public constructor (
        @InjectRepository(SupplierOfferElementSql) supplierOfferElementRepo: Repository<SupplierOfferElementSql>
    ) {
        super(supplierOfferElementRepo, "supplierOfferElementBySupplierOfferLoader", "supplierOfferId");
    }
}