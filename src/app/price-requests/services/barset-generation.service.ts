import { Injectable } from "@nestjs/common";
import { BaseSqlService } from "../../../core/services/base-sql.service";
import { BarsetGenerationInput, BarsetGenerationUpdate, BarsetGeneration, GqlBarsetGenerationUpdate } from "../interfaces/barset-generation.interface";
import { BarsetGenerationSql } from "../entities/barset-generation.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, EntityManager } from "typeorm";
import { BarsetGenerationLoader } from "../loaders/barset-generation.loader";
import { BarsetGenerationByPriceRequestLoader } from "../loaders/barset-generation-by-price-request.loader";
import { ErrorUtil } from "../../../core/utils/error.util";
import { AmalgamParam } from "../interfaces/amalgam.interface";
import { amalgamConfig } from "../config/amalgam.config";


@Injectable()
export class BarsetGenerationService extends BaseSqlService<BarsetGenerationSql, BarsetGenerationInput, BarsetGenerationUpdate> {

    public constructor(
        @InjectRepository(BarsetGenerationSql) barsetGenerationRepo: Repository<BarsetGenerationSql>,
        barsetGenerationLoader: BarsetGenerationLoader,
        private readonly _barsetGenerationByPriceRequestLoader: BarsetGenerationByPriceRequestLoader
    ) {
        super(barsetGenerationRepo, barsetGenerationLoader, BarsetGenerationSql, false);
    }

    /**
     * @description
     * @author Quentin Wolfs
     * @param {number} priceRequestId
     * @param {string} uuid
     * @returns {Promise<BarsetGeneration>}
     * @memberof BarsetGenerationService
     */
    public async getByPriceRequest(priceRequestId: number, uuid: string): Promise<BarsetGeneration> {
        try {
            return await this._barsetGenerationByPriceRequestLoader.get(uuid).load(priceRequestId);
        } catch (err) {
            throw ErrorUtil.get(err);
        }
    }

    /**
     * @description Update last used params of PriceRequest
     * @author Quentin Wolfs
     * @param {number} priceRequestId
     * @param {AmalgamParam} usedParams
     * @param {EntityManager} transaction
     * @returns {Promise<boolean>}
     * @memberof BarsetGenerationService
     */
    public async updateLastUsedParams(id: number, data: GqlBarsetGenerationUpdate, transaction: EntityManager): Promise<boolean> {
        try {
            if (data.params) {
                const newParams = this.formatNewParams(data.params);
                delete data.params;
                data = { ...data, ...newParams };
            }
            return await super.updateBy({ id: data.id }, data, transaction);
        } catch (e) {
            throw ErrorUtil.get(e);
        }
    }

    /**
     * @description Format AmalgamParam for database insertion
     * @author Quentin Wolfs
     * @param {AmalgamParamNew} usedParams
     * @param {PriceRequest} priceRequest
     * @returns {boolean}
     * @memberof BarsetGenerationService
     */
    public formatNewParams(usedParams: AmalgamParam): BarsetGeneration {
        return {
            beamLength: usedParams.beams.length,
            beamOtherLengths: usedParams.beams.otherLengths,
            beamIsAutoCut: usedParams.beams.isAutoCut,
            beamCutThreshold: usedParams.beams.cutThreshold,
            beamMaxLoss: usedParams.beams.maxLoss,
            tubeLength: usedParams.tubes.length,
            tubeOtherLengths: usedParams.tubes.otherLengths,
            tubeIsAutoCut: usedParams.tubes.isAutoCut,
            tubeCutThreshold: usedParams.tubes.cutThreshold,
            tubeMaxLoss: usedParams.tubes.maxLoss
        };
    }

    /**
     * @description Create base BarsetGeneration with default params
     * @author Quentin Wolfs
     * @param {BarsetGenerationInput} data
     * @param {EntityManager} [transaction]
     * @returns {Promise<BarsetGenerationSql>}
     * @memberof BarsetGenerationService
     */
    public async create(data: BarsetGenerationInput, transaction?: EntityManager): Promise<BarsetGenerationSql> {
        try {
            return await super.create(this.presetDefaultParams(data), transaction);
        } catch (err) {
            throw ErrorUtil.get(err);
        }
    }

    /**
     * @description Preset default AmalgamParams
     * @author Quentin Wolfs
     * @private
     * @param {BarsetGenerationInput} data
     * @returns {BarsetGenerationInput}
     * @memberof BarsetGenerationService
     */
    private presetDefaultParams(data: BarsetGenerationInput): BarsetGenerationInput {
        return {
            ...data,
            beamLength: amalgamConfig.default.beams.length,
            beamOtherLengths: amalgamConfig.default.beams.otherLengths,
            beamIsAutoCut: amalgamConfig.default.beams.isAutoCut,
            beamCutThreshold: amalgamConfig.default.beams.cutThreshold,
            beamMaxLoss: amalgamConfig.default.beams.maxLoss,
            tubeLength: amalgamConfig.default.tubes.length,
            tubeOtherLengths: amalgamConfig.default.tubes.otherLengths,
            tubeIsAutoCut: amalgamConfig.default.tubes.isAutoCut,
            tubeCutThreshold: amalgamConfig.default.tubes.cutThreshold,
            tubeMaxLoss: amalgamConfig.default.tubes.maxLoss,
        };
    }
}