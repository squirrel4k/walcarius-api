import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { VariantOptionSql } from "../entities/variant-option.entity";
import { Repository, EntityManager } from "typeorm";
import { VariantOptionLoader } from "../loaders/variant-option.loader";
import { VariantOptionByVariantLoader } from "../loaders/variant-option-by-variant.loader";
import { VariantOptionInput, VariantOptionUpdate, VariantOption, VariantOptionInpdate } from "../interfaces/variant-option.interface";
import { BaseSqlService } from "../../../core/services/base-sql.service";
import { ArrayUtil } from "../../../core/utils/array.util";
import { ErrorUtil } from "../../../core/utils/error.util";

@Injectable()
export class VariantOptionService extends BaseSqlService<VariantOptionSql, VariantOptionInput, VariantOptionUpdate> {

    public constructor(
        @InjectRepository(VariantOptionSql) variantOptionRepo: Repository<VariantOptionSql>,
        variantOptionLoader: VariantOptionLoader,
        private readonly _variantOptionByVariantLoader: VariantOptionByVariantLoader
    ) {
        super(variantOptionRepo, variantOptionLoader, VariantOptionSql, false);
    }

    /**
     * @description Get all VariantOption linked to a given Variant using Dataloader
     * @author Quentin Wolfs
     * @param {number} variantId
     * @param {string} uuid
     * @returns
     * @memberof VariantOptionService
     */
    public async getByVariant(variantId: number, uuid: string): Promise<VariantOption[]> {
        try {
            return this._variantOptionByVariantLoader.get(uuid).load(variantId);
        } catch (e) {
            throw ErrorUtil.get(e);
        }
    }

    /**
     * @description Upsert multiple VariantOption in the database
     * @author Quentin Wolfs
     * @param {VariantOptionInpdate[]} data
     * @param {(string | EntityManager)} extra
     * @returns {Promise<VariantOptionSql[]>}
     * @memberof VariantOptionService
     */
    public async upsertMany(data: VariantOptionInpdate[], extra: string | EntityManager): Promise<VariantOptionSql[]> {
        try {
            const insertable = ArrayUtil.splitArray(data, (option => option.id === undefined || option.id === null));
            let saved: VariantOptionSql[] = [];
            let updated: VariantOptionSql[] = [];

            if (insertable.valid.length > 0) {
                saved = await super.createMany(insertable.valid, typeof extra !== "string" ? extra : null);
            }
            if (insertable.invalid.length > 0) {
                updated = await super.updateMany(insertable.invalid, extra);
            }

            return [...saved, ...updated];
        } catch (e) {
            throw ErrorUtil.get(e);
        }
    }
}