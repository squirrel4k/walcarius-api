import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, FindOptionsWhere, Like, SelectQueryBuilder } from "typeorm";
import { ActionSql } from "../entities/action.entity";
import { Action, FilterAction } from "../interfaces/action.interface";
import { ActionByActionGroupLoader } from "../loaders/action-by-action-group.loader";
import { ErrorUtil } from "../../../core/utils/error.util";

@Injectable()
export class ActionService {

    public constructor (
        @InjectRepository(ActionSql) private readonly _actionRepo: Repository<ActionSql>,
        private readonly _actionByActionGroupLoader: ActionByActionGroupLoader
    ) { }

    /**
     * @description Search after a specific action (i.e. Laser cutting on ST37 with Thickness 2.5)
     * @author Quentin Wolfs
     * @param {string} searchName
     * @param {number} [actionGroupId]
     * @returns {Promise<Action[]>}
     * @memberof ActionService
     */
    public async searchAction(searchName: string, actionGroupId?: number): Promise<Action[]> {
        try {
            const where: FindOptionsWhere<ActionSql> = {};
            if (searchName != null) { where.name = Like(`%${searchName}%`); }
            if (actionGroupId != null) { where.actionGroupId = actionGroupId; }

            return this._actionRepo.find({ where });
        } catch (e) {
            throw ErrorUtil.get(e);
        }
    }

    /**
     * @description Get a single Action determined by a set of given pameters
     * @author Quentin Wolfs
     * @param {number} actionGroupId
     * @param {FilterAction} params
     * @returns {Promise<Action>}
     * @memberof ActionService
     */
    public async getActionByParameters(actionGroupId: number, params: FilterAction): Promise<Action> {
        try {
            let hasWhere: boolean = false;
            let query = this._actionRepo.createQueryBuilder("a");
            if (actionGroupId != null) {
                query = query.where("actionGroupId = :id", { id: actionGroupId });
                hasWhere = true;
            }
            query = this.resolveFilter(query, params, hasWhere);
            return query.getOne();
        } catch (e) {
            throw ErrorUtil.get(e);
        }
    }

    /**
     * @description Resolve Filter given for search
     * @author Quentin Wolfs
     * @private
     * @param {SelectQueryBuilder<ActionSql>} query
     * @param {FilterAction} filter
     * @param {boolean} hasWhere
     * @returns {SelectQueryBuilder<ActionSql>}
     * @memberof ActionService
     */
    private resolveFilter(query: SelectQueryBuilder<ActionSql>, filter: FilterAction, hasWhere: boolean):  SelectQueryBuilder<ActionSql> {
        if (filter.actionGroupId) {
            query = query[this.getWhereMethod(hasWhere)]("actionGroupId = :actionGroupId", { actionGroupId: filter.actionGroupId });
            hasWhere = true;
        }
        if (filter.matterId) {
            query = query[this.getWhereMethod(hasWhere)]("matterId = :matterId", { matterId: filter.matterId });
            hasWhere = true;
        }
        if (filter.thickness) {
            query = query[this.getWhereMethod(hasWhere)]("SON_EXTRACT(natureValues, \"$.Thickness\") = :thickness", { thickness: filter.thickness });
            hasWhere = true;
        }
        if (filter.diameter) {
            query = query[this.getWhereMethod(hasWhere)]("SON_EXTRACT(natureValues, \"$.Diameter\") = :diameter", { diameter: filter.diameter });
            hasWhere = true;
        }
        if (filter.section) {
            query = query[this.getWhereMethod(hasWhere)]("SON_EXTRACT(natureValues, \"$.Section\") = :section", { section: filter.section });
            hasWhere = true;
        }

        return query;
    }

    /**
     * @description Select correct where method for queryBuilder
     * @author Quentin Wolfs
     * @private
     * @param {boolean} hasWhere
     * @returns {string}
     * @memberof ActionService
     */
    private getWhereMethod(hasWhere: boolean): string {
        return hasWhere ? "andWhere" : "where";
    }

    /**
     * @description Get a single Action determined by it's thickness
     * @author Quentin Wolfs
     * @param {number} actionGroupId
     * @param {FilterAction} params
     * @returns {Promise<Action>}
     * @memberof ActionService
     */
    public async getActionByThickness(actionGroupId: number, params: FilterAction): Promise<Action> {
        try {
            let query = this._actionRepo.createQueryBuilder("a")
                .where("a.actionGroupId = :actionGroupId", { actionGroupId })
                .andWhere("JSON_EXTRACT(a.natureValues, \"$.Thickness\") - :thickness >= 0", { thickness: params.thickness })
                .orderBy("JSON_EXTRACT(a.natureValues, \"$.Thickness\")")
                .limit(1);
            if (params.matterId) { query = query.andWhere("a.matterId = :matterId", { matterId: params.matterId }); }

            return query.getOne();
        } catch (e) {
            throw ErrorUtil.get(e);
        }
    }

    /**
     * @description Get all Action which belong to an ActionGroup
     * @author Quentin Wolfs
     * @param {number} actionGroupId
     * @param {string} uuid
     * @returns
     * @memberof ActionService
     */
    public async getActionByActionGroup(actionGroupId: number, uuid: string): Promise<Action[]> {
        try {
            return this._actionByActionGroupLoader.get(uuid).load(actionGroupId);
        } catch (e) {
            throw ErrorUtil.get(e);
        }
    }
}