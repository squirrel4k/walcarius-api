import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { SupplierSql } from "../entities/supplier.entity";
import { ManyToOneSqlLoader } from "../../../core/dataloader/sql/mto-sql.loader";

@Injectable()
export class SupplierLoader extends ManyToOneSqlLoader<SupplierSql> {

    public constructor (
        @InjectRepository(SupplierSql) supplierRepo: Repository<SupplierSql>
    ) {
        super(supplierRepo, "suppliers");
    }
}