import { Injectable } from "@nestjs/common";
import { VariantSql } from "../entities/variant.entity";
import { Repository, EntityManager, FindConditions, FindManyOptions, In } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";
import { VariantLoader } from "../loaders/variant.loader";
import { Variant, VariantInpdate } from "../interfaces/variant.interface";
import { BaseSqlService } from "../../../core/services/base-sql.service";
import { VariantOptionService } from "./variant-option.service";
import { ErrorUtil } from "../../../core/utils/error.util";
import { PurchaseOrderQuantityByVariantLoader } from "../loaders/purchase-order-quantity-by-variant.loader";

@Injectable()
export class VariantService extends BaseSqlService<VariantSql, VariantInpdate, VariantInpdate> {

    public constructor(
        @InjectRepository(VariantSql) variantRepo: Repository<VariantSql>,
        variantLoader: VariantLoader,
        private readonly _variantOptionSrv: VariantOptionService,
        private readonly _purchaseOrderQuantityByVariantLoader: PurchaseOrderQuantityByVariantLoader
    ) {
        super(variantRepo, variantLoader, VariantSql, false);
    }

    /**
     * @description Update if existing, otherwise create a Variant
     * @author Quentin Wolfs
     * @param {VariantInpdate} data
     * @param {string} uuid
     * @param {EntityManager} [transaction]
     * @returns {Promise<Variant>}
     * @memberof VariantService
     */
    public async upsert(data: VariantInpdate, transaction?: EntityManager): Promise<Variant> {
        try {
            return !!data.id ?
                await this.update(data.id, data, transaction) :
                await this.create(data, transaction);
        } catch (e) {
            throw ErrorUtil.get(e);
        }
    }

    /**
     * @description Create a Variant and its VariantOptions
     * @author Quentin Wolfs
     * @param {VariantInpdate} data
     * @param {EntityManager} [transaction]
     * @returns {Promise<VariantSql>}
     * @memberof VariantService
     */
    public async create(data: VariantInpdate, transaction?: EntityManager): Promise<VariantSql> {
        try {
            const options = data.options;
            delete data.options;

            const created = await super.create(data, transaction);
            if (options) {
                const toSave = options.map(option => ({ ...option, variantId: created.id }));
                created.options = await this._variantOptionSrv.createMany(toSave, transaction);
            }

            return created;
        } catch (e) {
            throw ErrorUtil.get(e);
        }
    }

    /**
     * @description Update a variant and Upserts its VariantOptions
     * @author Quentin Wolfs
     * @param {number} id
     * @param {VariantInpdate} data
     * @param {(string | EntityManager)} extra
     * @returns {Promise<VariantSql>}
     * @memberof VariantService
     */
    public async update(id: number, data: VariantInpdate, extra: string | EntityManager): Promise<VariantSql> {
        try {
            const options = data.options;
            delete data.options;

            const updated = await super.update(id, data, extra);
            if (options) {
                const toUpsert = options.map(option => ({ ...option, variantId: updated.id }));
                updated.options = await this._variantOptionSrv.upsertMany(toUpsert, extra);
            }

            return updated;
        } catch (e) {
            throw ErrorUtil.get(e);
        }
    }

    /**
     * @description Delete all Variants matching the conditions, and their options as well
     * @author Quentin Wolfs
     * @param {FindConditions<VariantSql>} condition
     * @param {EntityManager} [transaction]
     * @returns {Promise<boolean>}
     * @memberof VariantService
     */
    public async deleteBy(condition: FindConditions<VariantSql>, transaction?: EntityManager): Promise<boolean> {
        try {
            const variants = await this.findWithOptions(condition, transaction);
            let optionIds = [];
            variants.forEach(variant => {
                if (variant.options.length > 0) { optionIds = [...optionIds, ...variant.options.map(opt => opt.id)]; }
            });
            if (optionIds.length > 0) { await this._variantOptionSrv.deleteBy({ id: In(optionIds) }, transaction); }

            return super.deleteBy(condition, transaction);
        } catch (err) {
            throw ErrorUtil.get(err);
        }
    }

    /**
     * @description Find all variant matching the search criteria with their options
     * @author Quentin Wolfs
     * @private
     * @param {FindConditions<VariantSql>} condition
     * @param {EntityManager} [transaction]
     * @returns {Promise<Variant[]>}
     * @memberof VariantService
     */
    private async findWithOptions(condition: FindConditions<VariantSql>, transaction?: EntityManager): Promise<Variant[]> {
        try {
            const options: FindManyOptions<VariantSql> = {
                where: condition,
                join: {
                    alias: "variant",
                    leftJoinAndSelect: {
                        options: "variant.options"
                    }
                }
            };

            return transaction ?
                transaction.find(VariantSql, options) :
                this._baseRepo.find(options);
        } catch (err) {
            throw ErrorUtil.get(err);
        }
    }

    /**
     * @description Gets the total quantity of this Variant already in a PurchaseOrder
     * @author Quentin Wolfs
     * @param {number} id
     * @param {string} uuid
     * @returns {Promise<number>}
     * @memberof PriceRequestElementService
     */
    public async getPurchaseOrderQuantity(id: number, uuid: string): Promise<number> {
        try {
            return await this._purchaseOrderQuantityByVariantLoader.get(uuid).load(id);
        } catch (e) {
            throw ErrorUtil.get(e);
        }
    }
}