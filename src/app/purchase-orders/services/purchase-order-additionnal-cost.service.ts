import { Injectable } from "@nestjs/common";
import { BaseSqlService } from "../../../core/services/base-sql.service";
import { PurchaseOrderAdditionnalCostSql } from "../entities/purchase-order-additionnal-cost.entity";
import { PurchaseOrderAdditionnalCostInput, PurchaseOrderAdditionnalCostUpdate, PurchaseOrderAdditionnalCost } from "../interfaces/purchase-order-additionnal-cost.interface";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, EntityManager } from "typeorm";
import { PurchaseOrderAdditionnalCostLoader } from "../loaders/purchase-order-additionnal-cost.loader";
import { PurchaseOrderACByPurchaseOrderLoader } from "../loaders/purchase-order-additionnal-cost-by-purchase-order.loader";
import { ErrorUtil } from "../../../core/utils/error.util";
import { SelectedSupplierOfferAdditionnalCost } from "../interfaces/purchase-order.interface";
import { MergedAdditionnalCost } from "../../price-requests/interfaces/price-request-additionnal-cost.interface";

@Injectable()
export class PurchaseOrderAdditionnalCostService extends BaseSqlService<PurchaseOrderAdditionnalCostSql, PurchaseOrderAdditionnalCostInput, PurchaseOrderAdditionnalCostUpdate> {

    public constructor(
        @InjectRepository(PurchaseOrderAdditionnalCostSql) purchaseOrderAdditionnalCostRepo: Repository<PurchaseOrderAdditionnalCostSql>,
        purchaseOrderAdditionnalCostLoader: PurchaseOrderAdditionnalCostLoader,
        private readonly _purchaseOrderACByPurchaseOrderLoader: PurchaseOrderACByPurchaseOrderLoader
    ) {
        super(purchaseOrderAdditionnalCostRepo, purchaseOrderAdditionnalCostLoader, PurchaseOrderAdditionnalCostSql, true);
    }

    /**
     * @description Get all PurchaseOrderAdditionnalCost related to a given PurchaseOrder using Dataloader
     * @author Quentin Wolfs
     * @param {number} purchaseOrderId
     * @param {string} uuid
     * @returns {Promise<PurchaseOrderAdditionnalCost[]>}
     * @memberof PurchaseOrderAdditionnalCostService
     */
    public async getByPurchaseOrder(purchaseOrderId: number, uuid: string): Promise<PurchaseOrderAdditionnalCost[]> {
        try {
            return this._purchaseOrderACByPurchaseOrderLoader.get(uuid).load(purchaseOrderId);
        } catch (e) {
            throw ErrorUtil.get(e);
        }
    }

    /**
     * @description Generate all PurchaseOrderAdditionnalCosts based on given SupplierOffer
     * @author Quentin Wolfs
     * @param {MergedAdditionnalCost[]} additionnalCosts
     * @param {number} purchaseOrderId
     * @param {EntityManager} transaction
     * @returns {Promise<PurchaseOrderAdditionnalCost[]>}
     * @memberof PurchaseOrderAdditionnalCostService
     */
    public async createFromSupplierOffer(
        additionnalCosts: MergedAdditionnalCost[],
        purchaseOrderId: number,
        selected: SelectedSupplierOfferAdditionnalCost[],
        transaction: EntityManager
    ): Promise<PurchaseOrderAdditionnalCost[]> {
        try {
            if (!additionnalCosts || additionnalCosts.length == 0 || !selected || selected.length == 0) { return []; }

            const toSave: PurchaseOrderAdditionnalCostInput[] = [];
            selected.forEach(selectedAC => {
                const additionnalCost = additionnalCosts.find(ac => {
                    return !!selectedAC.supplierOfferAdditionnalCostId ?
                        selectedAC.supplierOfferAdditionnalCostId == ac.supplierOfferAdditionnalCostId :
                        selectedAC.priceRequestAdditionnalCostId == ac.priceRequestAdditionnalCostId;
                });
                if (additionnalCost) { toSave.push(this.formatAdditionnalCostForSave(additionnalCost, selectedAC, purchaseOrderId)); }
            });

            return super.createMany(toSave, transaction);
        } catch (e) {
            throw ErrorUtil.get(e);
        }
    }

    /**
     * @description Format an AdditionnalCost for Database save
     * @author Quentin Wolfs
     * @private
     * @param {MergedAdditionnalCost} additionnalCost
     * @param {SelectedSupplierOfferAdditionnalCost} selected
     * @param {number} purchaseOrderId
     * @returns {PurchaseOrderElementInput}
     * @memberof PurchaseOrderAdditionnalCostService
     */
    private formatAdditionnalCostForSave(additionnalCost: MergedAdditionnalCost, selected: SelectedSupplierOfferAdditionnalCost, purchaseOrderId: number): PurchaseOrderAdditionnalCostInput {
        return {
            type: additionnalCost.type,
            denomination: additionnalCost.denomination,
            quantity: selected.quantity != null ? selected.quantity : additionnalCost.quantity,
            price: selected.price != null ? selected.price :  additionnalCost.price,
            unit: additionnalCost.unit,
            purchaseOrderId: purchaseOrderId
        };
    }
}