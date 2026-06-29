import { Injectable, BadRequestException } from "@nestjs/common";
import { PriceRequestAdditionnalCostSql } from "../entities/price-request-additionnal-cost.entity";
import { Repository, EntityManager } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";
import { PriceRequestAdditionnalCostLoader } from "../loaders/price-request-additionnal-cost.loader";
import { PriceRequestAdditionnalCostByPriceRequestLoader } from "../loaders/price-request-additionnal-cost-by-price-request.loader";
import { PriceRequestAdditionnalCost, PriceRequestAdditionnalCostInput, PriceRequestAdditionnalCostUpdate, AdditionnalCostType, AdditionnalCostUnit, MergedAdditionnalCost } from "../interfaces/price-request-additionnal-cost.interface";
import { BaseSqlService } from "../../../core/services/base-sql.service";
import { ErrorUtil } from "../../../core/utils/error.util";
import { SelectedSupplierOfferAdditionnalCost } from "../../purchase-orders/interfaces/purchase-order.interface";
import { ERROR_MESSAGE } from "../../../core/errors/enum/error.enum";
import { ArrayUtil } from "../../../core/utils/array.util";
import { BestPriceByPriceRequestAdditionnalCostLoader } from "../loaders/best-price-by-price-request-additionnal-cost.loader";

@Injectable()
export class PriceRequestAdditionnalCostService extends BaseSqlService<PriceRequestAdditionnalCostSql, PriceRequestAdditionnalCostInput, PriceRequestAdditionnalCostUpdate> {

    public constructor (
        @InjectRepository(PriceRequestAdditionnalCostSql) priceRequestAdditionnalCostRepo: Repository<PriceRequestAdditionnalCostSql>,
        priceRequestAdditionnalCostLoader: PriceRequestAdditionnalCostLoader,
        private readonly _priceRequestAdditionnalCostByPriceRequestLoader: PriceRequestAdditionnalCostByPriceRequestLoader,
        private readonly _bestPriceByPriceRequestAdditionnalCostLoader: BestPriceByPriceRequestAdditionnalCostLoader
    ) {
        super(priceRequestAdditionnalCostRepo, priceRequestAdditionnalCostLoader, PriceRequestAdditionnalCostSql, false);
    }

    /**
     * @description Get all PriceRequestAdditionnalCost belonging to a given PriceRequest using Dataloader
     * @author Quentin Wolfs
     * @param {number} priceRequestId
     * @param {string} uuid
     * @returns {Promise<PriceRequestAdditionnalCost[]>}
     * @memberof PriceRequestAdditionnalCostService
     */
    public async getByPriceRequest(priceRequestId: number, uuid: string): Promise<PriceRequestAdditionnalCost[]> {
        try {
            return await this._priceRequestAdditionnalCostByPriceRequestLoader.get(uuid).load(priceRequestId);
        } catch (e) {
            throw ErrorUtil.get(e);
        }
    }

    /**
     * @description Create default AdditionnalCost for a newly created PriceRequest
     * @author Quentin Wolfs
     * @param {number} priceRequestId
     * @param {EntityManager} [transaction]
     * @returns {Promise<PriceRequestAdditionnalCost[]>}
     * @memberof PriceRequestAdditionnalCostService
     */
    public async createForNewPriceRequest(priceRequestId: number, transaction?: EntityManager): Promise<PriceRequestAdditionnalCost[]> {
        try {
            const baseCosts: PriceRequestAdditionnalCostInput[] = [
                { type: AdditionnalCostType.TRANSPORT_FEE, quantity: 1, unit: AdditionnalCostUnit.EURO, priceRequestId },
                { type: AdditionnalCostType.PACKAGING_FEE, quantity: 1, unit: AdditionnalCostUnit.EURO, priceRequestId },
                { type: AdditionnalCostType.CERTIFICATE_FEE, quantity: 1, unit: AdditionnalCostUnit.EURO, priceRequestId }
            ];

            return super.createMany(baseCosts, transaction);
        } catch (e) {
            throw ErrorUtil.get(e);
        }
    }

    /**
     * @description Gets the required data to initialize new PurchaseOrder AdditionnalCosts from both PriceRequest & SupplierOffer AdditionnalCosts
     * @author Quentin Wolfs
     * @param {SelectedSupplierOfferAdditionnalCost[]} selected
     * @returns {Promise<MergedAdditionnalCost[]>}
     * @memberof PriceRequestAdditionnalCostService
     */
    public async getMergedForPurchaseOrder(selected: SelectedSupplierOfferAdditionnalCost[]): Promise<MergedAdditionnalCost[]> {
        try {
            if (selected.some(select => !select.priceRequestAdditionnalCostId && !select.supplierOfferAdditionnalCostId)) {
                throw new BadRequestException(ERROR_MESSAGE.INVALID_ADD_COSTS_FOR_PURCHASE_ORDER);
            }
            const selectedPrac = ArrayUtil.splitArray(selected, select => !!select.priceRequestAdditionnalCostId);

            const query = this._baseRepo.createQueryBuilder("prac")
                .select("prac.id", "priceRequestAdditionnalCostId")
                .addSelect("prac.type", "type")
                .addSelect("prac.denomination", "denomination")
                .addSelect("prac.quantity", "quantity")
                .addSelect("prac.unit", "unit")
                .addSelect("soac.id", "supplierOfferAdditionnalCostId")
                .addSelect("soac.price", "price")
                .leftJoin("prac.supplierOfferAdditionnalCosts", "soac");

            if (selectedPrac.valid.length > 0) {
                query.where("prac.id IN (:...pracIds)", { pracIds: selectedPrac.valid.map(select => select.priceRequestAdditionnalCostId) });
            }
            if (selectedPrac.invalid.length > 0) {
                query.orWhere("soac.id IN (:...soacIds)", { soacIds: selectedPrac.invalid.map(select => select.supplierOfferAdditionnalCostId) });
            }

            return await query.getRawMany();
        } catch (e) {
            throw ErrorUtil.get(e);
        }
    }

    /**
     * @description Get the best proposed price by a Supplier for an Additionnal Cost
     * @author Quentin Wolfs
     * @param {number} id
     * @param {string} uuid
     * @returns {Promise<number>}
     * @memberof PriceRequestAdditionnalCostService
     */
    public async getBestPrice(id: number, uuid: string): Promise<number> {
        try {
            return await this._bestPriceByPriceRequestAdditionnalCostLoader.get(uuid).load(id);
        } catch (e) {
            throw ErrorUtil.get(e);
        }
    }
}