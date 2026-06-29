import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { SupplierContactSql } from "../entities/supplier-contact.entity";
import { ManyToOneSqlLoader } from "../../../core/dataloader/sql/mto-sql.loader";

@Injectable()
export class SupplierContactLoader extends ManyToOneSqlLoader<SupplierContactSql> {

    public constructor (
        @InjectRepository(SupplierContactSql) supplierContactRepo: Repository<SupplierContactSql>
    ) {
        super(supplierContactRepo, "supplierContacts");
    }
}