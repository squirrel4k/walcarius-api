import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { PriceRequestElementOptionSql } from "../entities/price-request-element-option.entity";
import { Repository, EntityManager } from "typeorm";
import { PREOptionByPriceRequestElementLoader } from "../loaders/price-request-element-option-by-price-request-element.loader";
import { PriceRequestElementOptionLoader } from "../loaders/price-request-element-option.loader";
import { PriceRequestElementOption, PriceRequestElementOptionInput, PriceRequestElementOptionUpdate, OptionUnit, OptionType } from "../interfaces/price-request-element-option.interface";
import { BaseSqlService } from "../../../core/services/base-sql.service";
import { AmalgamGroup } from "../interfaces/amalgam-group.interface";
import { AmalgamGroupService } from "./amalgam-group.service";
import { ErrorUtil } from "../../../core/utils/error.util";
import { BestPriceByPriceRequestElementOptionLoader } from "../loaders/best-price-by-price-request-element-option.loader";

@Injectable()
export class PriceRequestElementOptionService extends BaseSqlService<PriceRequestElementOptionSql, PriceRequestElementOptionInput, PriceRequestElementOptionUpdate> {

    public constructor(
        @InjectRepository(PriceRequestElementOptionSql) priceRequestElementOptionRepo: Repository<PriceRequestElementOptionSql>,
        priceRequestElementOptionLoader: PriceRequestElementOptionLoader,
        private readonly _preOptionByPriceRequestElementLoader: PREOptionByPriceRequestElementLoader,
        private readonly _bestPriceByPriceRequestElementOptionLoader: BestPriceByPriceRequestElementOptionLoader,
        private readonly _amalgamGroupSrv: AmalgamGroupService
    ) {
        super(priceRequestElementOptionRepo, priceRequestElementOptionLoader, PriceRequestElementOptionSql, false);
    }

    /**
     * @description Get all PriceRequestElementOption linked to a given PriceRequestElement using Dataloader
     * @author Quentin Wolfs
     * @param {number} priceRequestElementId
     * @param {string} uuid
     * @returns {Promise<PriceRequestElementOption[]>}
     * @memberof PriceRequestElementOptionService
     */
    public async getByPriceRequestElement(priceRequestElementId: number, uuid: string): Promise<PriceRequestElementOption[]> {
        try {
            return this._preOptionByPriceRequestElementLoader.get(uuid).load(priceRequestElementId);
        } catch (e) {
            throw ErrorUtil.get(e);
        }
    }

    /**
     * @description Prepare PriceRequestElementOptions for a new PriceRequestElement
     * @author Quentin Wolfs
     * @param {number} priceRequestElementId
     * @param {AmalgamGroup} amalgamGroup
     * @param {EntityManager} transaction
     * @returns {PriceRequestElementOption[]}
     * @memberof PriceRequestElementOptionService
     */
    public async prepareForNewPriceRequestElement(priceRequestElementId: number, amalgamGroup: AmalgamGroup, transaction: EntityManager): Promise<PriceRequestElementOptionInput[]> {
        try {
            const options: PriceRequestElementOption[] = [];
            if (amalgamGroup.isBlasted || amalgamGroup.isPrimaryBlasted) {
                options.push({
                    type: OptionType.PROCESSING,
                    quantity: 1,
                    unit: OptionUnit.EURO_BY_TON,
                    priceRequestElementId,
                    denomination: amalgamGroup.isBlasted ? "Grenaillé" : "Grenaillé prépeint"
                });
            }
            if (amalgamGroup.isCut) {
                const partsQuantity = await this._amalgamGroupSrv.getAmalgamPartCount(amalgamGroup, transaction);
                options.push({
                    type: OptionType.CUT,
                    quantity: partsQuantity,
                    unit: OptionUnit.EURO_BY_UNIT,
                    priceRequestElementId
                });
            }

            return options;
        } catch (e) {
            throw ErrorUtil.get(e);
        }
    }

    /**
     * @description Create multiple options based on the requested priceRequestElement ids
     * @author Quentin Wolfs
     * @param {PriceRequestElementOptionInput} data
     * @returns {Promise<PriceRequestElementOption[]>}
     * @memberof PriceRequestElementOptionService
     */
    public async createForManyPriceRequestElements(data: PriceRequestElementOptionInput): Promise<PriceRequestElementOption[]> {
        try {
            const options: PriceRequestElementOptionInput[] = data.priceRequestElementIds.map(preId => ({
                ...data,
                priceRequestElementId: preId
            }));

            return await super.createMany(options);
        } catch (e) {
            throw ErrorUtil.get(e);
        }
    }

    /**
     * @description Get the best price proposed by a Supplier for this PriceRequestElementOption
     * @author Quentin Wolfs
     * @param {number} id
     * @param {string} uuid
     * @returns {Promise<number>}
     * @memberof PriceRequestElementOptionService
     */
    public async getBestPrice(id: number, uuid: string): Promise<number> {
        try {
            return await this._bestPriceByPriceRequestElementOptionLoader.get(uuid).load(id);
        } catch (e) {
            throw ErrorUtil.get(e);
        }
    }
}