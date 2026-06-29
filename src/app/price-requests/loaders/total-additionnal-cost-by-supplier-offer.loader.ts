import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { SupplierOfferAdditionnalCostSql } from "../entities/supplier-offer-additionnal-cost.entity";
import { BaseSqlLoader } from "../../../core/dataloader/sql/base-sql.loader";
import { AdditionnalCostUnit } from "../interfaces/price-request-additionnal-cost.interface";

interface AdditionnalCostResume {
    quantity: number;
    price: number;
    unit: AdditionnalCostUnit;
    supplierOfferId: number;
}

@Injectable()
export class TotalAdditionnalCostBySupplierOfferLoader extends BaseSqlLoader<number> {

    public readonly name: string;

    public constructor (
        @InjectRepository(SupplierOfferAdditionnalCostSql) private readonly _supplierOfferAdditionnalCostRepo: Repository<SupplierOfferAdditionnalCostSql>
    ) {
        super("totalAdditionnalCostBySupplierOffer");
    }

    protected async findByIds(ids: number[]): Promise<number[]> {
        const costs: AdditionnalCostResume[] = await this._supplierOfferAdditionnalCostRepo.createQueryBuilder("soac")
            .select("prac.quantity, soac.price, prac.unit, soac.supplierOfferId")
            .leftJoin("soac.priceRequestAdditionnalCost", "prac")
            .where("soac.supplierOfferId IN (:...ids)", { ids })
            .getRawMany();

        return ids.map(id => {
            const filtredCosts = costs.filter(cost => cost.supplierOfferId == id);

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