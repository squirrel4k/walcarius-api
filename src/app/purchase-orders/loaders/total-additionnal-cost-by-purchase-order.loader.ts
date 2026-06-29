import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { BaseSqlLoader } from "../../../core/dataloader/sql/base-sql.loader";
import { AdditionnalCostUnit } from "../../price-requests/interfaces/price-request-additionnal-cost.interface";
import { PurchaseOrderAdditionnalCostSql } from "../entities/purchase-order-additionnal-cost.entity";

interface AdditionnalCostResume {
    quantity: number;
    price: number;
    unit: AdditionnalCostUnit;
    purchaseOrderId: number;
}

@Injectable()
export class TotalAdditionnalCostByPurchaseOrderLoader extends BaseSqlLoader<number> {

    public readonly name: string;

    public constructor (
        @InjectRepository(PurchaseOrderAdditionnalCostSql) private readonly _purchaseOrderAdditionnalCostRepo: Repository<PurchaseOrderAdditionnalCostSql>
    ) {
        super("totalAdditionnalCostByPurchaseOrder");
    }

    protected async findByIds(ids: number[]): Promise<number[]> {
        const costs: AdditionnalCostResume[] = await this._purchaseOrderAdditionnalCostRepo.createQueryBuilder("poac")
            .select("poac.quantity, poac.price, poac.unit, poac.purchaseOrderId")
            .where("poac.purchaseOrderId IN (:...ids)", { ids })
            .getRawMany();

        return ids.map(id => {
            const filtredCosts = costs.filter(cost => cost.purchaseOrderId == id);

            return filtredCosts.length > 0 ?
                filtredCosts.map(cost => this.calculate(+cost.quantity, +cost.price, cost.unit)).reduce((prev, curr) => prev + curr) :
                0;
        });
    }

    private calculate(quantity: number, price: number, unit: AdditionnalCostUnit, parentQuantity?: number): number {
        switch (unit) {
            case AdditionnalCostUnit.EURO:
                return price;
            case AdditionnalCostUnit.EURO_BY_UNIT:
                return (parentQuantity ? parentQuantity : 1) * quantity * price;
            default:
                return price;
        }
    }
}