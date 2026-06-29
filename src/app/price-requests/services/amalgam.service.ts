import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { AmalgamSql } from "../entities/amalgam.entity";
import { Repository, In, EntityManager } from "typeorm";
import { Amalgam, AmalgamFilter, AmalgamInput } from "../interfaces/amalgam.interface";
import { AmalgamPartService } from "./amalgam-part.service";
import { WinstonLogger } from "../../common/logger/winston.logger";
import { classToPlain } from "class-transformer";
import { AmalgamPart } from "../interfaces/amalgam-part.interface";
import { ObjectUtil } from "../../../core/utils/object.util";
import { ArrayUtil } from "../../../core/utils/array.util";
import { AmalgamLoader } from "../loaders/amalgam.loader";
import { AmalgamByAmalgamGroupLoader } from "../loaders/amalgam-by-amalgam-group.loader";
import { BaseSqlService } from "../../../core/services/base-sql.service";
import { ErrorUtil } from "../../../core/utils/error.util";

@Injectable()
export class AmalgamService extends BaseSqlService<AmalgamSql, AmalgamInput, null> {

    public constructor(
        @InjectRepository(AmalgamSql) amalgamRepo: Repository<AmalgamSql>,
        amalgamLoader: AmalgamLoader,
        private readonly _amalgamPartSrv: AmalgamPartService,
        private readonly _amalgamByAmalgamGroupLoader: AmalgamByAmalgamGroupLoader,
        private readonly _logger: WinstonLogger
    ) {
        super(amalgamRepo, amalgamLoader, AmalgamSql, false);
    }

    /**
     * @description List all Amalgams that meet the filter from database
     * @author Quentin Wolfs
     * @param {AmalgamFilter} filter
     * @param {EntityManager} [manager]
     * @returns {Promise<Amalgam[]>}
     * @memberof AmalgamService
     */
    public async list(filter: AmalgamFilter, manager?: EntityManager): Promise<Amalgam[]> {
        try {
            const builder = manager ? manager.createQueryBuilder(AmalgamSql, "a") : this._baseRepo.createQueryBuilder("a");

            return await builder
                .leftJoin("amalgamGroups", "ag", "a.amalgamGroupId = ag.id")
                .leftJoin("priceRequestElements", "pre", "ag.id = pre.amalgamGroupId")
                .where("pre.priceRequestId = :id", { id: filter.priceRequestId })
                .getMany();
        } catch (e) {
            throw ErrorUtil.get(e);
        }
    }

    /**
     * @description Get all Amalgam belonging to an AmalgamGroup using Dataloader
     * @author Quentin Wolfs
     * @param {number} amalgamGroupId
     * @param {string} uuid
     * @returns {Promise<Amalgam[]>}
     * @memberof AmalgamService
     */
    public async getListByAmalgamGroup(amalgamGroupId: number, uuid: string): Promise<Amalgam[]> {
        try {
            return await this._amalgamByAmalgamGroupLoader.get(uuid).load(amalgamGroupId);
        } catch (e) {
            throw ErrorUtil.get(e);
        }
    }

    /**
     * @description Delete all Amalgams and their AmalgamParts belonging to a PriceRequest
     * @author Quentin Wolfs
     * @param {number} priceRequestId
     * @param {EntityManager} transaction
     * @returns {Promise<boolean>}
     * @memberof AmalgamService
     */
    public async deleteByPriceRequest(priceRequestId: number, transaction: EntityManager): Promise<boolean> {
        try {
            const amalgamIds = (await this.list({ priceRequestId }, transaction)).map(am => am.id);
            if (amalgamIds.length == 0) { return true; }

            const partsDeleted = await this._amalgamPartSrv.deleteBy({ amalgamId: In(amalgamIds) }, transaction);
            if (!partsDeleted) {
                this._logger.warn(`AmalgamParts couldn't be deleted for PriceRequest [${priceRequestId}]`);
                return false;
            }

            return super.deleteBy({ id: In(amalgamIds) }, transaction);
        } catch (e) {
            throw ErrorUtil.get(e);
        }
    }

    /**
     * @description save multiple Amalgams in database for a PriceRequest
     * @author Quentin Wolfs
     * @param {AmalgamInput[]} amalgams
     * @param {number} priceRequestId
     * @param {EntityManager} transaction
     * @returns {Promise<Amalgam[]>}
     * @memberof AmalgamService
     */
    public async createMultiple(amalgams: AmalgamInput[], priceRequestId: number, transaction: EntityManager): Promise<Amalgam[]> {
        try {
            if (!amalgams && amalgams.length == 0) { return []; }
            const saved: Amalgam[] = await super.createMany(this.prepareForSave(amalgams, priceRequestId), transaction);

            await this._amalgamPartSrv.createMany(this.assignAmalgamForParts(saved, amalgams), transaction);
            return saved;
        } catch (e) {
            throw ErrorUtil.get(e);
        }
    }

    /**
     * @description Prepare an array of AmalgamInput to be saved in database
     * @author Quentin Wolfs
     * @private
     * @param {AmalgamInput[]} amalgams
     * @param {number} priceRequestId
     * @returns {AmalgamInput[]}
     * @memberof AmalgamService
     */
    private prepareForSave(amalgams: AmalgamInput[], priceRequestId: number): AmalgamInput[] {
        return amalgams.map(amalgam => {
            const input: AmalgamInput = classToPlain(amalgam);
            input.priceRequestId = priceRequestId;
            input.isInStock = input.isInStock == null ? false : input.isInStock;
            if (input.parts) { delete input.parts; }
            if (input.id) { delete input.id; }

            return input;
        });
    }

    /**
     * @description Assign Amalgam ID to given AmalgamPart
     * @author Quentin Wolfs
     * @private
     * @param {Amalgam[]} savedAmalgams
     * @param {AmalgamInput[]} inputAmalgams
     * @returns {AmalgamPart[]}
     * @memberof AmalgamService
     */
    private assignAmalgamForParts(savedAmalgams: Amalgam[], inputAmalgams: AmalgamInput[]): AmalgamPart[] {
        let parts: AmalgamPart[] = [];
        const savedCopy = savedAmalgams.map(x => x);

        inputAmalgams.forEach(amalgam => {
            const found = ArrayUtil.findAndRemove(savedCopy, (saved => this.areTwoAmalgamEquals(amalgam, saved)));
            parts = [...parts, ...amalgam.parts.map(part => ({ amalgamId: found.id, supplyListElementId: part.supplyListElementId }))];
        });

        return parts;
    }

    /**
     * @description Verifies if two Amalgams are considered equals
     * @author Quentin Wolfs
     * @private
     * @param {Amalgam} base
     * @param {Amalgam} other
     * @returns {boolean}
     * @memberof AmalgamService
     */
    private areTwoAmalgamEquals(base: Amalgam, other: Amalgam): boolean {
        return ObjectUtil.equals(base, other, ["reference", "format", "loss", "isBlack", "isBlasted", "isPrimaryBlasted", "isLocked", "matterId"]);
    }

    /**
     * @description Get all locked Amalgam as if they were AmalgamInput
     * @author Quentin Wolfs
     * @private
     * @param {number} priceRequestId
     * @param {EntityManager} manager
     * @returns {Promise<AmalgamInput[]>}
     * @memberof AmalgamService
     */
    private async getLockedAmalgams(priceRequestId: number, manager): Promise<AmalgamInput[]> {
        try {
            return await manager.createQueryBuilder(AmalgamSql, "a")
                .select([
                    "ag.reference AS reference",
                    "ag.format AS format",
                    "ag.isEn1090 AS isEn1090",
                    "ag.isBlack AS isBlack",
                    "ag.isBlasted AS isBlasted",
                    "ag.isPrimaryBlasted AS isPrimaryBlasted",
                    "ag.isCut AS isCut",
                    "ag.matterReference AS matterRef",
                    "ag.supplyCategoryId AS supplyCategoryId",
                    "ag.matterId AS matterId",
                    "ag.elementId AS elementId",
                    "a.loss AS loss",
                    "a.isLocked AS isLocked",
                    "a.isInStock AS isInStock",
                    "a.stockPosition AS stockPosition",
                    "a.id AS id"
                ])
                .leftJoin("amalgamGroups", "ag", "a.amalgamGroupId = ag.id")
                .leftJoin("priceRequestElements", "pre", "ag.id = pre.amalgamGroupId")
                .where("a.isLocked = 1")
                .andWhere("pre.priceRequestId = :id", { id: priceRequestId })
                .getRawMany();
        } catch (e) {
            throw ErrorUtil.get(e);
        }
    }

    /**
     * @description  Get all locked Amalgam as if they were AmalgamInput with their AmalgamParts
     * @author Quentin Wolfs
     * @param {number} priceRequestId
     * @param {EntityManager} manager
     * @returns {Promise<AmalgamInput[]>}
     * @memberof AmalgamService
     */
    public async getLockedAmalgamsForPriceRequest(priceRequestId: number, manager: EntityManager): Promise<AmalgamInput[]> {
        const amalgams = await this.getLockedAmalgams(priceRequestId, manager);

        return this._amalgamPartSrv.getPartsForAmalgams(amalgams, manager);
    }
}