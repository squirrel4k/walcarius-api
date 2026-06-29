import { Injectable } from "@nestjs/common";
import { BaseSqlService } from "../../../core/services/base-sql.service";
import { SupplierOfferAdditionnalCostSql } from "../entities/supplier-offer-additionnal-cost.entity";
import { SupplierOfferAdditionnalCostInput, SupplierOfferAdditionnalCostUpdate, SupplierOfferAdditionnalCost, SupplierOfferAdditionnalCostInpdate } from "../interfaces/supplier-offer-additionnal-cost.interface";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, EntityManager } from "typeorm";
import { SupplierOfferAdditionnalCostLoader } from "../loaders/supplier-offer-additionnal-cost.loader";
import { SupplierOfferAdditionnalCostBySupplierOfferLoader } from "../loaders/supplier-offer-additionnal-cost-by-supplier-offer.loader";
import { SupplierOfferACByPriceRequestACLoader } from "../loaders/supplier-offer-ac-by-price-request-ac.loader";
import { TotalAdditionnalCostBySupplierOfferLoader } from "../loaders/total-additionnal-cost-by-supplier-offer.loader";
import { ArrayUtil } from "../../../core/utils/array.util";
import { ErrorUtil } from "../../../core/utils/error.util";

@Injectable()
export class SupplierOfferAdditionnalCostService extends BaseSqlService<SupplierOfferAdditionnalCostSql, SupplierOfferAdditionnalCostInput, SupplierOfferAdditionnalCostUpdate> {

    public constructor(
        @InjectRepository(SupplierOfferAdditionnalCostSql) supplierOfferAdditionnalCostRepo: Repository<SupplierOfferAdditionnalCostSql>,
        supplierOfferAdditionnalCostLoader: SupplierOfferAdditionnalCostLoader,
        private readonly _supplierOfferAdditionnalCostBySupplierOfferLoader: SupplierOfferAdditionnalCostBySupplierOfferLoader,
        private readonly _supplierOfferACByPriceRequestACLoader: SupplierOfferACByPriceRequestACLoader,
        private readonly _totalAdditionnalCostBySupplierOfferLoader: TotalAdditionnalCostBySupplierOfferLoader
    ) {
        super(supplierOfferAdditionnalCostRepo, supplierOfferAdditionnalCostLoader, SupplierOfferAdditionnalCostSql, false);
    }

    /**
     * @description Get all SupplierOfferAdditionnalCost related to a given SupplierOffer
     * @author Quentin Wolfs
     * @param {number} supplierOfferId
     * @param {string} uuid
     * @returns {Promise<SupplierOfferAdditionnalCost[]>}
     * @memberof SupplierOfferAdditionnalCostService
     */
    public async getBySupplierOffer(supplierOfferId: number, uuid: string): Promise<SupplierOfferAdditionnalCost[]> {
        try {
            return await this._supplierOfferAdditionnalCostBySupplierOfferLoader.get(uuid).load(supplierOfferId);
        } catch (e) {
            throw ErrorUtil.get(e);
        }
    }

    /**
     * @description Get all SupplierOfferAdditonnalCosts related to a given PriceRequestAdditionnalCost
     * @author Quentin Wolfs
     * @param {number} pracId
     * @param {string} uuid
     * @returns {Promise<SupplierOfferAdditionnalCost[]>}
     * @memberof SupplierOfferAdditionnalCostService
     */
    public async getByPriceRequestAdditionnalCost(pracId: number, uuid: string): Promise<SupplierOfferAdditionnalCost[]> {
        try {
            return await this._supplierOfferACByPriceRequestACLoader.get(uuid).load(pracId);
        } catch (e) {
            throw ErrorUtil.get(e);
        }
    }

    /**
     * @description Get the total price of all AdditionnalCosts for a SupplierOffer using Dataloader
     * @author Quentin Wolfs
     * @param {number} supplierOfferId
     * @param {string} uuid
     * @returns {Promise<number>}
     * @memberof SupplierOfferAdditionnalCostService
     */
    public async getTotalPriceBySupplierOffer(supplierOfferId: number, uuid: string): Promise<number> {
        try {
            return await this._totalAdditionnalCostBySupplierOfferLoader.get(uuid).load(supplierOfferId);
        } catch (e) {
            throw ErrorUtil.get(e);
        }
    }

    /**
     * @description Save multiple SupplierOfferAdditionnalCosts if they don't already exist in database, update otherwise
     * @author Quentin Wolfs
     * @param {SupplierOfferAdditionnalCostInpdate[]} data
     * @param {EntityManager} transaction
     * @returns {Promise<SupplierOfferAdditionnalCost[]>}
     * @memberof SupplierOfferAdditionnalCostService
     */
    public async upsertMany(data: SupplierOfferAdditionnalCostInpdate[], transaction: EntityManager): Promise<SupplierOfferAdditionnalCost[]> {
        try {
            const insertable = ArrayUtil.splitArray(data, (additionnalCost => additionnalCost.id === undefined || additionnalCost.id === null));
            const saved = await this.createMany(insertable.valid, transaction);
            const updated = await this.updateMany(insertable.invalid, transaction);

            return [...saved, ...updated];
        } catch (e) {
            throw ErrorUtil.get(e);
        }
    }
}