import { Injectable } from "@nestjs/common";
import { BaseSqlLoader } from "../../../core/dataloader/sql/base-sql.loader";
import { PriceRequestElementSql } from "../entities/price-request-element.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { PurchaseOrderStatus } from "../../purchase-orders/interfaces/purchase-order.interface";

@Injectable()
export class PurchaseOrderQuantityByPriceRequestElementLoader extends BaseSqlLoader<number> {

    public constructor(
        @InjectRepository(PriceRequestElementSql) private readonly _priceRequestElementRepo: Repository<PriceRequestElementSql>
    ) {
        super("purchaseOrderQuantityByPriceRequestElement");
    }

    protected async findByIds(ids: number[]): Promise<number[]> {
        const quantityByPre = await this._priceRequestElementRepo.createQueryBuilder("pre")
            .select("pre.id AS id, SUM(poe.quantity) AS quantity")
            .leftJoin("pre.supplierOfferElements", "soe", "soe.variantId IS NULL")
            .leftJoin("soe.purchaseOrderElements", "poe", "poe.deletedAt IS NULL")
            .leftJoin("poe.purchaseOrder", "po")
            .where("pre.id IN (:...ids)", { ids })
            .andWhere("po.status != :cancelled", { cancelled: PurchaseOrderStatus.CANCELLED })
            .groupBy("pre.id")
            .getRawMany();

        return ids.map(id => {
            const found = quantityByPre.find(quantity => quantity.id == id);
            return found && found.quantity ? found.quantity : 0;
        });
    }
}