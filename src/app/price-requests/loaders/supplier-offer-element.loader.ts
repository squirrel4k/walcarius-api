import { ManyToOneSqlLoader } from "../../../core/dataloader/sql/mto-sql.loader";
import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { SupplierOfferElementSql } from "../entities/supplier-offer-element.entity";

@Injectable()
export class SupplierOfferElementLoader extends ManyToOneSqlLoader<SupplierOfferElementSql> {

    public constructor (
        @InjectRepository(SupplierOfferElementSql) supplierOfferElementRepo: Repository<SupplierOfferElementSql>
    ) {
        super(supplierOfferElementRepo, "supplierOfferElements");
    }
}