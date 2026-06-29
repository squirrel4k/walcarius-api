import { Injectable, BadRequestException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { SupplyListSql } from "../entities/supply-list.entity";
import { Repository, IsNull, EntityManager, In, FindConditions } from "typeorm";
import { SupplyListLoader } from "../loaders/supply-list.loader";
import { SupplyList, SupplyListStatus, SupplyListInput, SupplyListUpdate, SupplyListFilter, SupplyListSort, SupplyListSortBy, SupplyListInfos } from "../interfaces/supply-list.interface";
import { ERROR_MESSAGE } from "../../../core/errors/enum/error.enum";
import { SupplyListByProjectLoader } from "../loaders/supply-list-by-project.loader";
import { classToPlain } from "class-transformer";
import { SupplyListElementService } from "./supply-list-element.service";
import { WinstonLogger } from "../../common/logger/winston.logger";
import { SupplyListByPriceRequestLoader } from "../loaders/supply-list-by-price-request.loader";
import { InfosBySupplyListLoader } from "../loaders/infos-by-supply-list.loader";
import { BaseSqlService } from "../../../core/services/base-sql.service";
import { ErrorUtil } from "../../../core/utils/error.util";
import {PriceRequestStatus} from "../../price-requests/interfaces/price-request.interface";

@Injectable()
export class SupplyListService extends BaseSqlService<SupplyListSql, SupplyListInput, SupplyListUpdate> {

    public constructor (
        @InjectRepository(SupplyListSql) supplyListRepo: Repository<SupplyListSql>,
        supplyListLoader: SupplyListLoader,
        private readonly _supplyListByProjectLoader: SupplyListByProjectLoader,
        private readonly _supplyListByPriceRequestLoader: SupplyListByPriceRequestLoader,
        private readonly _supplyListElementSrv: SupplyListElementService,
        private readonly _infosBySupplyListLoader: InfosBySupplyListLoader,
        private readonly _logger: WinstonLogger
    ) {
        super(supplyListRepo, supplyListLoader, SupplyListSql, false);
    }

    /**
     * @descriptionGet a list of all SupplyList
     * @author Quentin Wolfs
     * @param {SupplyListFilter} filter
     * @returns {Promise<SupplyList[]>}
     * @memberof SupplyListService
     */
    public async list(filter: SupplyListFilter, sort: SupplyListSort): Promise<SupplyList[]> {
        try {
            const where: FindConditions<SupplyListSql> = {};

            if (filter && filter.priceRequestId !== undefined) { where["priceRequestId"] = filter.priceRequestId === null ? IsNull() : filter.priceRequestId; }
            if (filter && filter.projectId !== undefined) { where["projectId"] = filter.projectId === null ? IsNull() : filter.projectId; }
            if (filter && filter.status) { where["status"] = filter.status; }

            return super.getList(where, sort ? { [SupplyListSortBy[sort.sortBy]]: sort.sortDirection } : { id: "ASC" });
        } catch (e) {
            throw ErrorUtil.get(e);
        }
    }

    /**
     * @description Get list of all SupplyList related to a Project using Dataloader
     * @author Quentin Wolfs
     * @param {number} projectId
     * @param {string} uuid
     * @returns {Promise<SupplyList[]>}
     * @memberof SupplyListService
     */
    public async getSupplyListsByProject(projectId: number, uuid: string): Promise<SupplyList[]> {
        try {
            return this._supplyListByProjectLoader.get(uuid).load(projectId);
        } catch (e) {
            throw ErrorUtil.get(e);
        }
    }

    /**
     * @description Get list of all SupplyList related to a Price Request using Dataloader
     * @author Quentin Wolfs
     * @param {number} priceRequestId
     * @param {string} uuid
     * @returns {Promise<SupplyList[]>}
     * @memberof SupplyListService
     */
    public async getSupplyListsByPriceRequest(priceRequestId: number, uuid: string): Promise<SupplyList[]> {
        try {
            return this._supplyListByPriceRequestLoader.get(uuid).load(priceRequestId);
        } catch (e) {
            throw ErrorUtil.get(e);
        }
    }

    /**
     * @description Free all SupplyLists from a PriceRequest
     * @author Quentin Wolfs
     * @param {number} priceRequestId
     * @param {EntityManager} transaction
     * @returns {Promise<boolean>}
     * @memberof SupplyListService
     */
    public async forceFreeFromPriceRequest(priceRequestId: number, transaction: EntityManager): Promise<boolean> {
        try {
            return (await transaction.createQueryBuilder()
                .update(SupplyListSql)
                .set({ status: SupplyListStatus.OPEN, priceRequestId: null })
                .where("priceRequestId = :id", { id: priceRequestId })
                .execute()
            ).raw.affectedRows > 0;
        } catch (e) {
            throw ErrorUtil.get(e);
        }
    }

    /**
     * @description Delete (hard) a SupplyList if it doesn't belong to a PriceRequest
     * @author Quentin Wolfs
     * @param {number} id
     * @param {EntityManager} transaction
     * @returns {Promise<boolean>}
     * @memberof SupplyListService
     */
    public async delete(id: number, transaction: EntityManager): Promise<boolean> {
        try {
            const supplyList = await super.getById(id, transaction);

            if (supplyList.priceRequestId !== null || supplyList.status !== SupplyListStatus.OPEN) {
                throw new BadRequestException(ERROR_MESSAGE.SUPPLY_LIST_ALREADY_ASSIGNED);
            }

            // Delete related SupplyListElement
            const elementsDeleted = await this._supplyListElementSrv.deleteBy({ supplyListId: id }, transaction);
            if (!elementsDeleted) { this._logger.warn(`Couldn't delete elements for supplyList ${id}.`); }

            return elementsDeleted && await super.delete(id, transaction);
        } catch (e) {
            throw ErrorUtil.get(e);
        }
    }

        /**
     * @description Delete (hard) a SupplyList if it doesn't belong to a PriceRequest by ids
     * @author Khalil bennis
     * @param {number[]} ids
     * @param {EntityManager} transaction
     * @returns {Promise<boolean>}
     * @memberof SupplyListService
     */
        public async deleteByIds(ids: number[], transaction: EntityManager): Promise<boolean> {
            try {
                const supplyLists = await super.getBy({
                    id: In(ids)
                }, transaction);
    
                supplyLists.forEach(sl => {
                    if (sl.priceRequestId !== null || sl.status !== SupplyListStatus.OPEN) {
                    throw new BadRequestException(ERROR_MESSAGE.SUPPLY_LIST_ALREADY_ASSIGNED);
                }})
    
                // Delete related SupplyListElement
                const elementsDeleted = await this._supplyListElementSrv.deleteBy({ supplyListId: In(ids) }, transaction);
                if (!elementsDeleted) { this._logger.warn(`Couldn't delete elements for supplyLists ${ids.join(',')}.`); }
    
                return elementsDeleted && await super.deleteBy({id: In(ids)}, transaction);
            } catch (e) {
                throw ErrorUtil.get(e);
            }
        }

    /**
     * @description Save a new SupplyList in the database
     * @author Quentin Wolfs
     * @param {SupplyListInput} data
     * @param {number} projectId
     * @param {EntityManager} transaction
     * @returns {Promise<SupplyList>}
     * @memberof SupplyListService
     */
    public async createOne(data: SupplyListInput, projectId: number, transaction: EntityManager): Promise<SupplyListSql> {
        try {
            // Adapt data for database
            const savableElements = data.elements;
            delete data.elements;
            const toSave: SupplyList = classToPlain(data);
            toSave.projectId = projectId;
            toSave.status = SupplyListStatus.OPEN;
            const supplyList = await super.create(toSave, transaction);

            // Create SupplyListElements
            savableElements.forEach(element => element.supplyListId = supplyList.id);
            const elements = await this._supplyListElementSrv.createMany(savableElements, transaction);
            supplyList.elements = Array.isArray(elements) ? elements : [];

            return supplyList;
        } catch (e) {
            throw ErrorUtil.get(e);
        }
    }

    /**
     * @description Update global info of a SupplyList
     * @author Quentin Wolfs
     * @param {number} id
     * @param {SupplyListUpdate} data
     * @param {string|EntityManager} extra
     * @returns {Promise<SupplyList>}
     * @memberof SupplyListService
     */
    public async update(id: number, data: SupplyListUpdate, extra: string | EntityManager): Promise<SupplyListSql> {
        try {
            // Remove elements from SupplyList before update
            const toUpdate: SupplyListUpdate = classToPlain(data);
            if (toUpdate.elements) { delete toUpdate.elements; }

            return super.update(id, toUpdate, extra);
        } catch (e) {
            throw ErrorUtil.get(e);
        }
    }

    /**
     * @description Assign multiple SupplyLists to a PriceRequest
     * @author Quentin Wolfs
     * @param {number} priceRequestId
     * @param {number[]} supplyListIds
     * @param {EntityManager} transaction
     * @param {string} uuid
     * @returns {Promise<boolean>}
     * @memberof SupplyListService
     */
    public async assignToPriceRequest(priceRequestId: number, supplyListIds: number[], transaction: EntityManager, uuid: string): Promise<boolean> {
        try {
            if (supplyListIds.length == 0) { return true; }

            const supplyLists: SupplyList[] = await transaction.find(SupplyListSql, { id: In(supplyListIds) });
            if (supplyLists.some(sl => sl.priceRequestId != null || sl.status != SupplyListStatus.OPEN)) {
                throw new BadRequestException(ERROR_MESSAGE.SUPPLY_LIST_ALREADY_ASSIGNED);
            }

            return (await transaction.createQueryBuilder()
                .update(SupplyListSql)
                .set({ status: SupplyListStatus.TAKEN, priceRequestId: priceRequestId })
                .whereInIds(supplyListIds)
                .execute()
            ).raw.affectedRows == supplyListIds.length;
        } catch (e) {
            throw ErrorUtil.get(e);
        }
    }

    /**
     * @description Free a SupplyList from a PriceRequest
     * @author Quentin Wolfs
     * @param {SupplyList} supplyList
     * @param {EntityManager} transaction
     * @returns {Promise<boolean>}
     * @memberof SupplyListService
     */
    public async freeFromPriceRequest(supplyList: SupplyList, transaction: EntityManager): Promise<boolean> {
        try {
            return await this.isSupplyListFreeable(supplyList, transaction) ?
                (await transaction.update(SupplyListSql, supplyList.id, { priceRequestId: null, status: SupplyListStatus.OPEN })).raw.affectedRows == 1 :
                false;
        } catch (e) {
            throw ErrorUtil.get(e);
        }
    }

    /**
     * @description Check whether a SupplyList can be removed safely from a PriceRequest or not
     * @author Quentin Wolfs
     * @private
     * @param {SupplyList} supplyList
     * @param {EntityManager} [transaction]
     * @returns {boolean}
     * @memberof SupplyListService
     */
    public async isSupplyListFreeable(supplyList: SupplyList, transaction?: EntityManager): Promise<boolean> {
        if (await this.hasSupplierOfferElements(supplyList.id, transaction)) {
            throw new BadRequestException(ERROR_MESSAGE.SUPPLY_LIST_CONTAINS_ENCODED_PRICES);
        }
        if (await this.isLockedInAmalgam(supplyList.id, transaction)) {
            throw new BadRequestException(ERROR_MESSAGE.SUPPLY_LIST_IN_LOCKED_AMALGAMS);
        }
        if (supplyList.priceRequestId == null || supplyList.status == SupplyListStatus.OPEN) {
            throw new BadRequestException(ERROR_MESSAGE.SUPPLY_LIST_NOT_IN_PRICE_REQUEST);
        }

        return true;
    }

    /**
     * @description Verifies if a SupplyList is editable (not assignated to a sent PriceRequest)
     * @author Quentin Wolfs
     * @param {number} id
     * @returns {Promise<boolean>}
     * @memberof SupplyListService
     */
    public async isSupplyListEditable(id: number): Promise<boolean> {
        try {
            const supplyList = await this._baseRepo.createQueryBuilder("sl")
                .leftJoinAndSelect("sl.priceRequest", "pr")
                .where("sl.id = :id", { id })
                .getOne();

            return supplyList.priceRequestId == null || supplyList.priceRequest.status !== PriceRequestStatus.SENT;
        } catch (e) {
            throw ErrorUtil.get(e);
        }
    }

    /**
     * @description Check if a SupplyList is used in a locked Amalgam
     * @author Quentin Wolfs
     * @private
     * @param {number} id
     * @param {EntityManager} [transaction]
     * @returns {Promise<boolean>}
     * @memberof SupplyListService
     */
    private async isLockedInAmalgam(id: number, transaction?: EntityManager): Promise<boolean> {
        try {
            const builder = transaction ? transaction.createQueryBuilder(SupplyListSql, "sl") : this._baseRepo.createQueryBuilder("sl");

            const queryResult = await builder
                .select("COUNT(a.isLocked) AS lockedCount")
                .leftJoin("supplyListElements", "sle", "sl.id = sle.supplyListId")
                .leftJoin("amalgamParts", "ap", "sle.id = ap.supplyListElementId")
                .leftJoin("amalgams", "a", "ap.amalgamId = a.id")
                .where("sl.id = :id", { id })
                .andWhere("a.isLocked = 1")
                .getRawMany();

            return queryResult.length > 0 ? queryResult[0].lockedCount > 0 : true;
        } catch (e) {
            throw ErrorUtil.get(e);
        }
    }

    /**
     * @description Check if a SupplyList is at least partially sent to a Supplier
     * @author Quentin Wolfs
     * @private
     * @param {number} id
     * @param {EntityManager} [transaction]
     * @returns {Promise<boolean>}
     * @memberof SupplyListService
     */
    private async isSentToSupplier(id: number, transaction?: EntityManager): Promise<boolean> {
        try {
            const builder = transaction ? transaction.createQueryBuilder(SupplyListSql, "sl") : this._baseRepo.createQueryBuilder("sl");

            const supplierOffers = await builder
                .select(["DISTINCT so.id", "isSent"])
                .leftJoin("priceRequests", "pr", "sl.priceRequestId = pr.id")
                .leftJoin("supplierOffers", "so", "pr.id = so.priceRequestId")
                .where("sl.id = :id", { id })
                .getRawMany();

            return supplierOffers.length > 0 ? supplierOffers.some(offer => offer.isSent) : false;
        } catch (e) {
            throw ErrorUtil.get(e);
        }
    }

    /**
     * @description Check if a SupplyList contains SupplierOfferElements encoded for its elements
     * @author Quentin Wolfs
     * @private
     * @param {number} id
     * @param {EntityManager} [transaction]
     * @returns {Promise<boolean>}
     * @memberof SupplyListService
     */
    private async hasSupplierOfferElements(id: number, transaction?: EntityManager): Promise<boolean> {
        try {
            const builder = transaction ? transaction.createQueryBuilder(SupplyListSql, "sl") : this._baseRepo.createQueryBuilder("sl");

            const result = await builder
                .select("DISTINCT COUNT(soe.id) AS count")
                .leftJoin("supplyListElements", "sle", "sl.id = sle.supplyListId")
                .leftJoin("amalgamParts", "ap", "sle.id = ap.supplyListElementId")
                .leftJoin("amalgams", "a", "ap.amalgamId = a.id")
                .leftJoin("amalgamGroups", "ag", "a.amalgamGroupId = ag.id")
                .leftJoin("priceRequestElements", "pre", "sle.id = pre.supplyListElementId OR ag.id = pre.amalgamGroupId")
                .leftJoin("supplierOfferElements", "soe", "pre.id = soe.priceRequestElementId AND soe.price IS NOT NULL")
                .where("sl.id = :id", { id })
                .getRawOne();

            return result.count > 0;
        } catch (e) {
            throw ErrorUtil.get(e);
        }
    }

    /**
     * @description Get a summary of all options (Black / Blasted / Primary blasted) and matter references in the SupplyList
     * @author Quentin Wolfs
     * @param {number} id
     * @param {string} uuid
     * @returns {Promise<SupplyListInfos>}
     * @memberof SupplyListService
     */
    public async getInfos(id: number, uuid: string): Promise<SupplyListInfos> {
        try {
            return await this._infosBySupplyListLoader.get(uuid).load(id);
        } catch (e) {
            throw ErrorUtil.get(e);
        }
    }
}