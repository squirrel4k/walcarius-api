import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, In, EntityManager } from "typeorm";
import { SupplierOfferElementOptionSql } from "../entities/supplier-offer-element-option.entity";
import { SupplierOfferElementOptionLoader } from "../loaders/supplier-offer-element-option.loader";
import { SOEOptionByPREOptionLoader } from "../loaders/supplier-offer-element-option-by-price-request-element.loader";
import { SupplierOfferElementOption, SupplierOfferElementOptionInput, SupplierOfferElementOptionUpdate, SupplierOfferElementOptionInpdate } from "../interfaces/supplier-offer-element-option.interface";
import { BaseSqlService } from "../../../core/services/base-sql.service";
import { ArrayUtil } from "../../../core/utils/array.util";
import { SOEOptionBySupplierOfferElementLoader } from "../loaders/supplier-offer-element-option-by-supplier-offer-element.loader";
import { ErrorUtil } from "../../../core/utils/error.util";
import { PriceRequestElementOption } from "../interfaces/price-request-element-option.interface";
import { SupplierOfferElement } from "../interfaces/supplier-offer-element.interface";

@Injectable()
export class SupplierOfferElementOptionService extends BaseSqlService<SupplierOfferElementOptionSql, SupplierOfferElementOptionInput, SupplierOfferElementOptionUpdate> {

    public constructor(
        @InjectRepository(SupplierOfferElementOptionSql) supplierOfferElementOptionRepo: Repository<SupplierOfferElementOptionSql>,
        supplierOfferElementOptionLoader: SupplierOfferElementOptionLoader,
        private readonly _soeOptionByPreOptionLoader: SOEOptionByPREOptionLoader,
        private readonly _soeOptionsBySupplierOfferElementLoader: SOEOptionBySupplierOfferElementLoader
    ) {
        super(supplierOfferElementOptionRepo, supplierOfferElementOptionLoader, SupplierOfferElementOptionSql, false);
    }

    /**
     * @description Get all SupplierOfferElementOption that are linked to the given PriceRequestElementOption using Dataloader
     * @author Quentin Wolfs
     * @param {number} priceRequestElementOptionId
     * @param {string} uuid
     * @returns {Promise<SupplierOfferElementOption[]>}
     * @memberof SupplierOfferElementOptionService
     */
    public async getByPriceRequestElementOption(priceRequestElementOptionId: number, uuid: string): Promise<SupplierOfferElementOption[]> {
        try {
            return await this._soeOptionByPreOptionLoader.get(uuid).load(priceRequestElementOptionId);
        } catch (e) {
            throw ErrorUtil.get(e);
        }
    }

    /**
     * @description Delete all SupplierOfferElementOption related to a given PriceRequestElementOption
     * @author Quentin Wolfs
     * @param {number[]} priceRequestElementOptionIds
     * @returns {Promise<boolean>}
     * @memberof SupplierOfferElementOptionService
     */
    public async deleteByPriceRequestElementOptions(priceRequestElementOptionIds: number[]): Promise<boolean> {
        try {
            if (priceRequestElementOptionIds.length == 0) { return true; }
            const count: number = await this._baseRepo.count({ where: { amalgamId: In(priceRequestElementOptionIds) } as any });

            return count > 0 ? (await this._baseRepo.delete({ priceRequestElementOptionId: In(priceRequestElementOptionIds) })).raw.affectedRows == count : true;
        } catch (e) {
            throw ErrorUtil.get(e);
        }
    }

    /**
     * @description Upsert multiple SupplierOfferElementOptions (create if doesn't exist, update otherwise)
     * @author Quentin Wolfs
     * @param {SupplierOfferElementOptionInpdate[]} data
     * @param {EntityManager} transaction
     * @returns {Promise<SupplierOfferElementOption[]>}
     * @memberof SupplierOfferElementOptionService
     */
    public async upsertMany(data: SupplierOfferElementOptionInpdate[], transaction: EntityManager): Promise<SupplierOfferElementOption[]> {
        try {
            const insertable = ArrayUtil.splitArray(data, (option => option.id === undefined || option.id === null));
            const saved = await this.createMany(insertable.valid, transaction);
            const updated = await this.updateMany(insertable.invalid, transaction);

            return [...saved, ...updated];
        } catch (e) {
            throw ErrorUtil.get(e);
        }
    }

    /**
     * @description Get all SupplierOfferElementOption that are linked to the given SupplierOfferElement using Dataloader
     * @author Quentin Wolfs
     * @param {number} supplierOfferElementId
     * @param {string} uuid
     * @returns {Promise<SupplierOfferElementOption[]>}
     * @memberof SupplierOfferElementOptionService
     */
    public async getBySupplierOfferElement(supplierOfferElementId: number, uuid: string): Promise<SupplierOfferElementOption[]> {
        try {
            return this._soeOptionsBySupplierOfferElementLoader.get(uuid).load(supplierOfferElementId);
        } catch (e) {
            throw ErrorUtil.get(e);
        }
    }

    /**
     * @description Creates missing SupplierOfferElementOptions for the newly created SupplierOfferElements
     * @author Quentin Wolfs
     * @param {PriceRequestElementOption[]} missingOptions
     * @param {SupplierOfferElement[]} created
     * @param {EntityManager} [transaction]
     * @returns {Promise<SupplierOfferElementOption[]>}
     * @memberof SupplierOfferElementOptionService
     */
    public async createMissingOptions(missingOptions: PriceRequestElementOption[], created: SupplierOfferElement[], transaction?: EntityManager): Promise<SupplierOfferElementOption[]> {
        try {
            const toSave: SupplierOfferElementOptionInput[] = [];

            created.forEach(soe => {
                const options = missingOptions.filter(option => option.priceRequestElementId == soe.priceRequestElementId);
                options.forEach(option => {
                    toSave.push({ priceRequestElementOptionId: option.id, supplierOfferElementId: soe.id });
                });
            });

            return toSave.length > 0 ? await this.createMany(toSave, transaction) : [];
        } catch (e) {
            throw ErrorUtil.get(e);
        }
    }
}