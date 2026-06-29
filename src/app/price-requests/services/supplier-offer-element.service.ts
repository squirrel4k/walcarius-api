import { Injectable } from "@nestjs/common";
import { SupplierOfferElementSql } from "../entities/supplier-offer-element.entity";
import { PriceRequestElementSql } from "../entities/price-request-element.entity";
import { Repository, EntityManager, In, FindOptionsWhere, IsNull } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";
import { SupplierOfferElement, SupplierOfferElementInpdate } from "../interfaces/supplier-offer-element.interface";
import { SupplierOfferElementLoader } from "../loaders/supplier-offer-element.loader";
import { SupplierOfferElementBySupplierOfferLoader } from "../loaders/supplier-offer-element-by-supplier-offer.loader";
import { instanceToPlain } from "class-transformer";
import { ArrayUtil } from "../../../core/utils/array.util";
import { SOElementByPossiblePRElementLoader } from "../loaders/supplier-offer-element-by-possible-price-request-element.loader";
import { SupplierOfferElementByPriceRequestElementLoader } from "../loaders/supplier-offer-element-by-price-request-element.loader";
import { VariantService } from "./variant.service";
import { BaseSqlService } from "../../../core/services/base-sql.service";
import { SupplierOfferElementOptionService } from "./supplier-offer-element-option.service";
import { PriceRequestElementUpdate } from "../interfaces/price-request-element.interface";
import { ErrorUtil } from "../../../core/utils/error.util";
import { PriceRequestElementOptionService } from "./price-request-element-option.service";
import { ComputedPriceBySupplierOfferElementLoader } from "../loaders/computed-price-by-supplier-offer-element.loader";

@Injectable()
export class SupplierOfferElementService extends BaseSqlService<SupplierOfferElementSql, SupplierOfferElementInpdate, SupplierOfferElementInpdate> {

    public constructor (
        @InjectRepository(SupplierOfferElementSql) supplierOfferElementRepo: Repository<SupplierOfferElementSql>,
        supplierOfferElementLoader: SupplierOfferElementLoader,
        private readonly _supplierOfferElementBySupplierOfferLoader: SupplierOfferElementBySupplierOfferLoader,
        private readonly _SOElementByPossiblePRElementLoader: SOElementByPossiblePRElementLoader,
        private readonly _supplierOfferElementByPriceRequestElementLoader: SupplierOfferElementByPriceRequestElementLoader,
        private readonly _variantSrv: VariantService,
        private readonly _supplierOfferElementOptionSrv: SupplierOfferElementOptionService,
        @InjectRepository(PriceRequestElementSql) private readonly _priceRequestElementRepo: Repository<PriceRequestElementSql>,
        private readonly _priceRequestElementOptionSrv: PriceRequestElementOptionService,
        private readonly _computedPriceBySupplierOfferElementLoader: ComputedPriceBySupplierOfferElementLoader
    ) {
        super(supplierOfferElementRepo, supplierOfferElementLoader, SupplierOfferElementSql, false);
    }

    /**
     * @description Get all SupplierOfferElements that belongs to a SupplierOffer using DataLoader
     * @author Quentin Wolfs
     * @param {number} id
     * @param {string} uuid
     * @returns {Promise<SupplierOfferElement[]>}
     * @memberof SupplierOfferElementService
     */
    public async getBySupplierOffer(id: number, uuid: string): Promise<SupplierOfferElement[]> {
        try {
            return await this._supplierOfferElementBySupplierOfferLoader.get(uuid).load(id);
        } catch (e) {
            throw ErrorUtil.get(e);
        }
    }

    /**
     * @description Update if existing or Insert otherwise SupplierOfferElement
     * @author Quentin Wolfs
     * @param {SupplierOfferElementInpdate[]} data
     * @param {EntityManager} transaction
     * @returns {Promise<SupplierOfferElement[]>}
     * @memberof SupplierOfferElementService
     */
    public async upsertMany(data: SupplierOfferElementInpdate[], transaction: EntityManager): Promise<SupplierOfferElement[]> {
        try {
            const preUpdate: PriceRequestElementUpdate[] = [];
            data.forEach(element => {
                if (!!element.priceRequestElement) {
                    element.priceRequestElement.id = element.priceRequestElementId;
                    preUpdate.push(element.priceRequestElement);
                    delete element.priceRequestElement;
                }
            });
            // Update weight of PriceRequestElements (direct repo — no service circular dep)
            for (const pre of preUpdate) {
                const { id, ...fields } = pre as PriceRequestElementUpdate & { id: number };
                if (id) {
                    await transaction.update(PriceRequestElementSql, id, fields);
                }
            }

            // Upsert SupplierOfferElements
            const insertable = ArrayUtil.splitArray(data, (element => element.id === undefined || element.id === null));
            let saved: SupplierOfferElement[] = [];
            let updated: SupplierOfferElement[] = [];

            if (insertable.valid.length > 0) { saved = await this.recursivelyCreate(insertable.valid, transaction); }
            if (insertable.invalid.length > 0) {
                await this.recursivelyUpdate(insertable.invalid.slice(0), transaction);
                updated = await super.getBy({ id: In(insertable.invalid.map(element => element.id)) }, transaction);
            }

            return [...saved, ...updated];
        } catch (e) {
            throw ErrorUtil.get(e);
        }
    }

    /**
     * @description Recursively insert SupplierOfferElement and their Variant using Transaction
     * @author Quentin Wolfs
     * @private
     * @param {SupplierOfferElementInpdate[]} data
     * @param {EntityManager} transaction
     * @returns {Promise<SupplierOfferElement[]>}
     * @memberof SupplierOfferElementService
     */
    private async recursivelyCreate(data: SupplierOfferElementInpdate[], transaction: EntityManager): Promise<SupplierOfferElement[]> {
        try {
            if (data.length === 0) { return []; }

            const current = data.shift();
            const hasVariant = !!current.variant;
            if (hasVariant) {
                const variant = await this._variantSrv.create(current.variant, transaction);
                current.variantId = variant ? variant.id : null;
                delete current.variant;
            }
            const options = current.options;
            delete current.options;
            const created = await super.create(current, transaction);

            if (options && !hasVariant) {
                created.options = await this._supplierOfferElementOptionSrv.createMany(options.map(option => ({ ...option, supplierOfferElementId: created.id })), transaction);
            }

            return [created, ...await this.recursivelyCreate(data, transaction)];
        } catch (e) {
            throw ErrorUtil.get(e);
        }
    }

    /**
     * @description Recursively update SupplierOfferElement by using Transaction
     * @author Quentin Wolfs
     * @param {SupplierOfferElementInpdate[]} data
     * @param {EntityManager} transaction
     * @param {string} uuid
     * @returns {Promise<boolean>}
     * @memberof SupplierOfferElementService
     */
    protected async recursivelyUpdate(data: SupplierOfferElementInpdate[], transaction: EntityManager): Promise<boolean> {
        try {
            if (data.length == 0) { return true; }

            const current = data.shift();
            const hasVariant = !!current.variant;
            if (hasVariant) {
                const variant = await this._variantSrv.upsert(current.variant, transaction);
                current.variantId = variant ? variant.id : null;
                delete current.variant;
            }
            const options = current.options;
            delete current.options;
            const done = (await transaction.update(SupplierOfferElementSql, current.id, instanceToPlain(current))).raw.affectedRows == 1;

            if (options && !hasVariant) {
                await this._supplierOfferElementOptionSrv.upsertMany(options, transaction);
            }
            return done && this.recursivelyUpdate(data, transaction);
        } catch (e) {
            throw ErrorUtil.get(e);
        }
    }

    /**
     * @description Get the SupplierOfferElement corresponding to a specific Possible PriceRequestElement (which is linked to a SupplierOffer)
     * @author Quentin Wolfs
     * @param {number} priceRequestElementId
     * @param {number} supplierOfferId
     * @param {string} uuid
     * @returns {Promise<SupplierOfferElement[]>}
     * @memberof SupplierOfferElementService
     */
    public async getByPossiblePriceRequestElement(priceRequestElementId: number, supplierOfferId: number, uuid: string): Promise<SupplierOfferElement[]> {
        try {
            return await this._SOElementByPossiblePRElementLoader.get(uuid).load({ id: priceRequestElementId, supplierOfferId });
        } catch (e) {
            throw ErrorUtil.get(e);
        }
    }

    /**
     * @description Get all SupplierOfferElement for a PriceRequestElement
     * @author Quentin Wolfs
     * @param {number} priceRequestElementId
     * @param {string} uuid
     * @returns {Promise<SupplierOfferElement[]>}
     * @memberof SupplierOfferElementService
     */
    public async getByPriceRequestElement(priceRequestElementId: number, uuid: string): Promise<SupplierOfferElement[]> {
        try {
            return await this._supplierOfferElementByPriceRequestElementLoader.get(uuid).load(priceRequestElementId);
        } catch (e) {
            throw ErrorUtil.get(e);
        }
    }

    /**
     * @description Associate SupplierOfferElements to a SupplierOffer to link "Not possible" PriceRequestElements
     * @author Quentin Wolfs
     * @param {number} supplierOfferId
     * @param {number[]} associatedIds
     * @param {number[]} deletedIds
     * @param {EntityManager} transaction
     * @returns {Promise<SupplierOfferElement[]>}
     * @memberof SupplierOfferElementService
     */
    public async associateMany(supplierOfferId: number, associatedIds: number[], deletedIds: number[], transaction: EntityManager): Promise<SupplierOfferElement[]> {
        try {
            // Extract and save all missing SupplierOfferElements
            const created = await this.createMissingElements(supplierOfferId, associatedIds, transaction);

            // Delete selected SupplierOfferElements and their options
            if (deletedIds.length > 0) {
                await this._supplierOfferElementOptionSrv.deleteBy({ supplierOfferElementId: In(deletedIds) }, transaction);
                await this.deleteBy({ id: In(deletedIds) }, transaction);
            }

            return created.filter(soe => !deletedIds.some(id => id == soe.id));
        } catch (e) {
            throw ErrorUtil.get(e);
        }
    }

    /**
     * @description Create missing SupplierOfferElement
     * @author Quentin Wolfs
     * @private
     * @param {number} supplierOfferId
     * @param {number[]} associatedIds
     * @param {EntityManager} transaction
     * @returns {Promise<SupplierOfferElement[]>}
     * @memberof SupplierOfferElementService
     */
    private async createMissingElements(supplierOfferId: number, associatedIds: number[], transaction: EntityManager): Promise<SupplierOfferElement[]> {
        try {
            // Get all existing SupplierOfferElements
            const existing = await this.getBy({ supplierOfferId, variantId: IsNull() }, transaction);

            // Save missing SupplierOfferElements
            const missingIds = ArrayUtil.substractArray(associatedIds, existing.map(soe => soe.priceRequestElementId));
            const created = missingIds.length > 0 ?
                await super.createMany(missingIds.map(id => ({ priceRequestElementId: id, supplierOfferId })), transaction) : [];

            // Save missing SupplierOfferElements' options
            if (missingIds.length > 0) {
                const missingOptions = await this._priceRequestElementOptionSrv.getBy({ priceRequestElementId: In(missingIds) }, transaction);
                await this._supplierOfferElementOptionSrv.createMissingOptions(missingOptions, created, transaction);
            }

            return [...existing, ...created];
        } catch (err) {
            throw ErrorUtil.get(err);
        }
    }

    /**
     * @description Delete all SupplierOfferElements matching the conditions, their options and variants as well
     * @author Quentin Wolfs
     * @param {FindOptionsWhere<SupplierOfferElementSql>} condition
     * @param {EntityManager} [transaction]
     * @returns {Promise<boolean>}
     * @memberof SupplierOfferElementService
     */
    public async deleteBy(condition: FindOptionsWhere<SupplierOfferElementSql>, transaction?: EntityManager): Promise<boolean> {
        try {
            const elements = await super.getBy(condition, transaction);
            if (elements.length == 0) { return true; }

            // Delete Supplier Offer Element and related Options
            const optionDeleted = this._supplierOfferElementOptionSrv.deleteBy({ supplierOfferElementId: In(elements.map(soe => soe.id)) }, transaction);
            const soeDeleted = await super.deleteBy(condition, transaction);

            // Delete related variants
            const variantIds = elements.filter(soe => !!soe.variantId).map(soe => soe.variantId);
            const variantDeleted = variantIds.length > 0 ? await this._variantSrv.deleteBy({ id: In(variantIds) }, transaction) : true;
            return soeDeleted && variantDeleted && optionDeleted;
        } catch (err) {
            throw ErrorUtil.get(err);
        }
    }

    /**
     * @description Compute the total price of an element with its options using DataLoader
     * @author Quentin Wolfs
     * @param {number} id
     * @param {string} uuid
     * @returns {Promise<number>}
     * @memberof SupplierOfferElementService
     */
    public async getComputedPrice(id: number, uuid: string): Promise<number> {
        try {
            return await this._computedPriceBySupplierOfferElementLoader.get(uuid).load(id);
        } catch (e) {
            throw ErrorUtil.get(e);
        }
    }
}
