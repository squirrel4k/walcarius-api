import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, IsNull, In } from "typeorm";
import { SupplierContactSql } from "../entities/supplier-contact.entity";
import { OneToManySqlLoader } from "../../../core/dataloader/sql/otm-sql.loader";

@Injectable()
export class SupplierContactBySupplierLoader extends OneToManySqlLoader<SupplierContactSql> {

    public constructor (
        @InjectRepository(SupplierContactSql) supplierContactRepo: Repository<SupplierContactSql>
    ) {
        super(supplierContactRepo, "supplierContactBySuppliers", "supplierId", {
            where: {
                deletedAt: IsNull()
            }
        });
    }
}