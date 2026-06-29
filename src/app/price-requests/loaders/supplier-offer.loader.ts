import { ManyToOneSqlLoader } from "../../../core/dataloader/sql/mto-sql.loader";
import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { SupplierOfferSql } from "../entities/supplier-offer.entity";
import { Repository } from "typeorm";

@Injectable()
export class SupplierOfferLoader extends ManyToOneSqlLoader<SupplierOfferSql> {

    public constructor (
        @InjectRepository(SupplierOfferSql) supplierOfferRepo: Repository<SupplierOfferSql>
    ) {
        super(supplierOfferRepo, "supplierOffers");
    }
}