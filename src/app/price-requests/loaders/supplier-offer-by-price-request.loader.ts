import { Injectable } from "@nestjs/common";
import { OneToManySqlLoader } from "../../../core/dataloader/sql/otm-sql.loader";
import { Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";
import { SupplierOfferSql } from "../entities/supplier-offer.entity";

@Injectable()
export class SupplierOfferByPriceRequestLoader extends OneToManySqlLoader<SupplierOfferSql> {

    public constructor (
        @InjectRepository(SupplierOfferSql) supplierOfferRepo: Repository<SupplierOfferSql>
    ) {
        super(supplierOfferRepo, "supplierOfferByPriceRequest", "priceRequestId");
    }
}