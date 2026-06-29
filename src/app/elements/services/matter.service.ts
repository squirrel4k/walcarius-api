import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, FindManyOptions, In, EntityManager } from "typeorm";
import { Matter } from "../interfaces/matter.interface";
import { MatterSql } from "../entities/matter.entity";
import { MatterLoader } from "../loaders/matter.loader";
import { MatterByElementGroupLoader } from "../loaders/matter-by-element-group.loader";
import { MatterByActionGroupLoader } from "../loaders/matter-by-action-group.loader";
import { BaseSqlService } from "../../../core/services/base-sql.service";
import { ErrorUtil } from "../../../core/utils/error.util";
import { amalgamConfig } from "../../price-requests/config/amalgam.config";

@Injectable()
export class MatterService extends BaseSqlService<MatterSql, null, null> {

    public constructor (
        @InjectRepository(MatterSql) matterRepo: Repository<MatterSql>,
        matterLoader: MatterLoader,
        private readonly _matterByElementGroupLoader: MatterByElementGroupLoader,
        private readonly _matterByActionGroupLoader: MatterByActionGroupLoader
    ) {
        super(matterRepo, matterLoader, MatterSql, true);
    }

    /**
     * @description List all matters
     * @author Quentin Wolfs
     * @param {boolean} [forCustom=false]
     * @returns {Promise<Matter[]>}
     * @memberof MatterService
     */
    public async matterList(forCustom: boolean = false): Promise<Matter[]> {
        try {
            const authorizedForCustom: string[] = ["ST37", "ST52", "INOX"];
            const options: FindManyOptions = {
                order: { name: "ASC" }
            };
            if (forCustom) { options.where = { name: In(authorizedForCustom) }; }

            return this._baseRepo.find(options);
        } catch (e) {
            throw ErrorUtil.get(e);
        }
    }

    /**
     * @description Get list of all Matter related to an ElementGroup using Dataloader
     * @author Quentin Wolfs
     * @param {number} elementGroupId
     * @param {string} uuid
     * @returns {Promise<Matter[]>}
     * @memberof MatterService
     */
    public async getMattersByElementGroup(elementGroupId: number, uuid: string): Promise<Matter[]> {
        try {
            return this._matterByElementGroupLoader.get(uuid).load(elementGroupId);
        } catch (e) {
            throw ErrorUtil.get(e);
        }
    }

    /**
     * @description Get list of all Matter related to an ActionGroup using Dataloader
     * @author Quentin Wolfs
     * @param {number} actionGroupId
     * @param {string} uuid
     * @returns {Promise<Matter[]>}
     * @memberof MatterService
     */
    public async getMattersByActionGroup(actionGroupId: number, uuid: string): Promise<Matter[]> {
        try {
            return this._matterByActionGroupLoader.get(uuid).load(actionGroupId);
        } catch (e) {
            throw ErrorUtil.get(e);
        }
    }

    /**
     * @description Get all matters defined for amalgamable elements in a set of SupplyLists
     * @author Quentin Wolfs
     * @param {number[]} supplyListIds
     * @param {EntityManager} transaction
     * @returns {Promise<Matter[]>}
     * @memberof MatterService
     */
    public async getMattersRequiredForAmalgams(supplyListIds: number[], transaction: EntityManager): Promise<Matter[]> {
        try {
            if (supplyListIds.length === 0) { return []; }

            return transaction.createQueryBuilder(MatterSql, "m")
                .leftJoin("m.supplyListElements", "sle")
                .where("sle.supplyListId IN (:...supplyListIds)", { supplyListIds })
                .andWhere("sle.supplyCategoryId IN (:...categoryIds)", { categoryIds: amalgamConfig.usedCategoryIds })
                .getMany();
        } catch (e) {
            throw ErrorUtil.get(e);
        }
    }
}