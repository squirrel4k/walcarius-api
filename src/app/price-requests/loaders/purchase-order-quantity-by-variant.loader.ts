import { Injectable } from "@nestjs/common";
import { BaseSqlLoader } from "../../../core/dataloader/sql/base-sql.loader";
import { InjectRepository } from "@nestjs/typeorm";
import { VariantSql } from "../entities/variant.entity";
import { Repository } from "typeorm";
import { PurchaseOrderStatus } from "../../purchase-orders/interfaces/purchase-order.interface";

@Injectable()
export class PurchaseOrderQuantityByVariantLoader extends BaseSqlLoader<number> {

    public constructor(
        @InjectRepository(VariantSql) private readonly _variantRepo: Repository<VariantSql>
    ) {
        super("purchaseOrderQuantityByVariant");
    }

    protected async findByIds(ids: number[]): Promise<number[]> {
        const quantityByVariant = await this._variantRepo.createQueryBuilder("v")
            .select("v.id AS id, SUM(poe.quantity) AS quantity")
            .leftJoin("v.supplierOfferElement", "soe")
            .leftJoin("soe.purchaseOrderElements", "poe", "poe.deletedAt IS NULL")
            .leftJoin("poe.purchaseOrder", "po")
            .where("v.id IN (:...ids)", { ids })
            .andWhere("po.status != :cancelled", { cancelled: PurchaseOrderStatus.CANCELLED })
            .groupBy("v.id")
            .getRawMany();

        return ids.map(id => {
            const found = quantityByVariant.find(quantity => quantity.id == id);
            return found && found.quantity ? found.quantity : 0;
        });
    }
}