import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { BaseSqlLoader } from "../../../core/dataloader/sql/base-sql.loader";
import { PriceCalculatorManager } from "../../price-requests/managers/price-calculator.manager";
import { PurchaseOrderElementSql } from "../../purchase-orders/entities/purchase-order-element.entity";

@Injectable()
export class TotalPriceByPurchaseOrderLoader extends BaseSqlLoader<number> {

    public constructor (
        @InjectRepository(PurchaseOrderElementSql) private readonly _purchaseOrderElementRepo: Repository<PurchaseOrderElementSql>,
        private readonly _priceCalculatorMgr: PriceCalculatorManager
    ) {
        super("totalPriceByPurchaseOrder");
    }

    protected async findByIds(ids: number[]): Promise<number[]> {
        const elements = await this._purchaseOrderElementRepo.createQueryBuilder("poe")
            .leftJoinAndSelect("poe.options", "poeo")
            .where("poe.purchaseOrderId IN (:...ids)", { ids })
            .getMany();

        return ids.map(id => {
            const relatedData = elements.filter(data => data.purchaseOrderId == id);
            if (relatedData.length == 0) { return 0; }
            const total = relatedData.map(data => this._priceCalculatorMgr.getPrice({ ...data, forcedQuantityUnit: data.unit }))
                .reduce((prev, curr) => prev + curr);

            return +total.toFixed(2);
        });
    }
}