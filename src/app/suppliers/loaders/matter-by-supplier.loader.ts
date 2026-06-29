import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { BaseSqlLoader } from "../../../core/dataloader/sql/base-sql.loader";
import { MatterSql } from "../../elements/entities/matter.entity";
import { SupplierSql } from "../entities/supplier.entity";

@Injectable()
export class MatterBySupplierLoader extends BaseSqlLoader<MatterSql[]> {

    public constructor (
        @InjectRepository(SupplierSql) private readonly _supplierRepo: Repository<SupplierSql>
    ) {
        super("MattersBySupplier");
    }

    protected async findByIds(ids: number[]): Promise<MatterSql[][]> {
        const suppliers = await this._supplierRepo.createQueryBuilder("s")
            .leftJoinAndSelect("s.matters", "m", "m.deletedAt IS NULL")
            .whereInIds(ids)
            .getMany();

        return ids.map(id => {
            const foundSupplier = suppliers.find(supplier => supplier.id == id);
            return foundSupplier ? foundSupplier.matters : [];
        });
    }
}