import { Injectable } from "@nestjs/common";
import { BaseSqlService } from "../../../core/services/base-sql.service";
import { PurchaseOrderElementOptionSql } from "../entities/purchase-order-element-option.entity";
import { PurchaseOrderElementOptionInput, PurchaseOrderElementOptionInpdate, PurchaseOrderElementOption } from "../interfaces/purchase-order-element-option.interface";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, EntityManager } from "typeorm";
import { PurchaseOrderElementOptionLoader } from "../loaders/purchase-order-element-option.loader";
import { POElementOptionByPOElementLoader } from "../loaders/purchase-order-element-option-by-purchase-order-element.loader";
import { SupplierOfferElement } from "../../price-requests/interfaces/supplier-offer-element.interface";
import { PurchaseOrderElement } from "../interfaces/purchase-order-element.interface";
import { VariantOption } from "../../price-requests/interfaces/variant-option.interface";
import { SupplierOfferElementOption } from "../../price-requests/interfaces/supplier-offer-element-option.interface";
import { ErrorUtil } from "../../../core/utils/error.util";
import { ArrayUtil } from "../../../core/utils/array.util";
import { OptionType, OptionUnit } from "../../price-requests/interfaces/price-request-element-option.interface";

@Injectable()
export class PurchaseOrderElementOptionService extends BaseSqlService<PurchaseOrderElementOptionSql, PurchaseOrderElementOptionInput, PurchaseOrderElementOptionInpdate> {

    public constructor(
        @InjectRepository(PurchaseOrderElementOptionSql) purchaseOrderElementOptionRepo: Repository<PurchaseOrderElementOptionSql>,
        purchaseOrderElementOptionLoader: PurchaseOrderElementOptionLoader,
        private readonly _poElementOptionByPoElementLoader: POElementOptionByPOElementLoader
    ) {
        super(purchaseOrderElementOptionRepo, purchaseOrderElementOptionLoader, PurchaseOrderElementOptionSql, true);
    }

    /**
     * @description Get all PurchaseOrderElementOptions related to a given PurchaseOrderElement using Dataloader
     * @author Quentin Wolfs
     * @param {number} purchaseOrderElementId
     * @param {string} uuid
     * @returns {Promise<PurchaseOrderElementOption[]>}
     * @memberof PurchaseOrderElementOptionService
     */
    public async getByPurchaseOrderElement(purchaseOrderElementId: number, uuid: string): Promise<PurchaseOrderElementOption[]> {
        try {
            return this._poElementOptionByPoElementLoader.get(uuid).load(purchaseOrderElementId);
        } catch (e) {
            throw ErrorUtil.get(e);
        }
    }

    /**
     * @description Create multiple PurchaseOrderElementOption based on a SupplierOffer (and its elements) and already created PurchaseOrderElements
     * @author Quentin Wolfs
     * @param {SupplierOfferElement[]} soElements
     * @param {PurchaseOrderElement[]} poElements
     * @param {EntityManager} transaction
     * @returns {Promise<PurchaseOrderElementOption[]>}
     * @memberof PurchaseOrderElementOptionService
     */
    public async createFromSupplierOffer(soElements: SupplierOfferElement[], poElements: PurchaseOrderElement[], transaction: EntityManager)
    : Promise<PurchaseOrderElementOption[]> {
        try {
            if (!soElements || soElements.length == 0 || !poElements || poElements.length == 0) { return []; }

            const toSave: PurchaseOrderElementOptionInput[] = [];
            poElements.forEach(poElement => {
                const soElement = soElements.find(soe => poElement.supplierOfferElementId == soe.id);
                if (soElement && soElement.variant && soElement.variant.options) {
                    toSave.push(...soElement.variant.options.map(option => this.parseFromVariant(option, poElement.id)));
                }
                if (soElement && soElement.options) {
                    toSave.push(...soElement.options.map(option => this.parseFromSupplierOffer(option, poElement.id)));
                }
            });

            return super.createMany(toSave, transaction);
        } catch (e) {
            throw ErrorUtil.get(e);
        }
    }

    /**
     * @description Parse a VariantOption into a PurchaseOrderElementOption
     * @author Quentin Wolfs
     * @private
     * @param {VariantOption} option
     * @param {number} purchaseOrderElementId
     * @returns {PurchaseOrderElementOption}
     * @memberof PurchaseOrderElementOptionService
     */
    private parseFromVariant(option: VariantOption, purchaseOrderElementId: number): PurchaseOrderElementOption {
        return {
            type: option.type,
            denomination: option.denomination,
            quantity: option.quantity,
            price: option.price,
            unit: option.unit,
            purchaseOrderElementId: purchaseOrderElementId
        };
    }

    /**
     * @description Parse a SupplierOfferElementOption into a PurchaseOrderElementOption
     * @author Quentin Wolfs
     * @private
     * @param {SupplierOfferElementOption} option
     * @param {number} purchaseOrderElementId
     * @returns {PurchaseOrderElementOption}
     * @memberof PurchaseOrderElementOptionService
     */
    private parseFromSupplierOffer(option: SupplierOfferElementOption, purchaseOrderElementId: number): PurchaseOrderElementOption {
        return {
            type: option.priceRequestElementOption.type,
            denomination: option.priceRequestElementOption.denomination,
            quantity: option.priceRequestElementOption.quantity,
            price: option.price,
            unit: option.priceRequestElementOption.unit,
            purchaseOrderElementId: purchaseOrderElementId
        };
    }

    /**
     * @description Update if existing or Insert otherwise PurchaseOrderElementOption
     * @author Quentin Wolfs
     * @param {PurchaseOrderElementOptionInpdate[]} data
     * @param {EntityManager} transaction
     * @returns {Promise<PurchaseOrderElementOption[]>}
     * @memberof PurchaseOrderElementOptionService
     */
    public async upsertMany(data: PurchaseOrderElementOptionInpdate[], transaction: EntityManager): Promise<PurchaseOrderElementOption[]> {
        try {
            const insertable = ArrayUtil.splitArray(data, (element => element.id === undefined || element.id === null));
            let saved: PurchaseOrderElementOption[] = [];
            let updated: PurchaseOrderElementOption[] = [];

            if (insertable.valid.length > 0) {
                const toInsert = insertable.valid.map(option => this.buildFromInpdate(option));
                saved = await super.createMany(toInsert, transaction);
            }
            if (insertable.invalid.length > 0) {
                updated = await super.updateMany(insertable.invalid, transaction);
            }

            return [...saved, ...updated];
        } catch (e) {
            throw ErrorUtil.get(e);
        }
    }

    /**
     * @description Build from Inpdate to set default values if they're not present in given object
     * @author Quentin Wolfs
     * @private
     * @param {PurchaseOrderElementOptionInpdate} option
     * @returns {PurchaseOrderElementOption}
     * @memberof PurchaseOrderElementOptionService
     */
    private buildFromInpdate(option: PurchaseOrderElementOptionInpdate): PurchaseOrderElementOption {
        return {
            ...option,
            quantity : option.quantity || 1,
            type: option.type || OptionType.OTHER,
            unit: option.unit || OptionUnit.EURO_BY_UNIT
        };
    }
}