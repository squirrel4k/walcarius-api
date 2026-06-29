import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { PriceRequestSql } from "../entities/price-request.entity";
import { PriceRequest, PriceRequestInput, PriceRequestUpdate, PriceRequestFilter, PriceRequestSort, PriceRequestSortBy, PriceRequestStatus, PriceRequestStatusDisplay } from "../interfaces/price-request.interface";
import { Repository, EntityManager, SelectQueryBuilder, Brackets } from "typeorm";
import { PriceRequestLoader } from "../loaders/price-request.loader";
import { BaseSqlService } from "../../../core/services/base-sql.service";
import { ErrorUtil } from "../../../core/utils/error.util";
import { OrderByDirection } from "../../../core/interfaces/crud.interface";

@Injectable()
export class PriceRequestService extends BaseSqlService<PriceRequestSql, PriceRequestInput, PriceRequestUpdate> {

    public constructor(
        @InjectRepository(PriceRequestSql) priceRequestRepo: Repository<PriceRequestSql>,
        priceRequestLoader: PriceRequestLoader
    ) {
        super(priceRequestRepo, priceRequestLoader, PriceRequestSql, true);
    }

    /**
     * @description Process front list filters
     * @author Quentin Wolfs
     * @protected
     * @param {SelectQueryBuilder<PriceRequestSql>} query
     * @param {PriceRequestFilter} filter
     * @param {string} [alias]
     * @memberof PriceRequestService
     */
    protected processListFilters(query: SelectQueryBuilder<PriceRequestSql>, filter: PriceRequestFilter, alias?: string): void {
        query.where(`${alias}.deletedAt IS NULL`);
        if (!!filter.search && filter.search.length > 0) {
            query.andWhere(new Brackets(builder => {
                // Join all required tables
                query.leftJoin(`${alias}.user`, "u")
                    .leftJoin(`${alias}.supplyLists`, "sl")
                    .leftJoin("sl.project", "p")
                    .leftJoin("sl.elements", "sle")
                    .leftJoin("sle.supplyCategory", "sc")
                    .leftJoin("sc.parentSupplyCategory", "psc");

                builder.where(`${alias}.reference LIKE :search`, { search: `%${filter.search}%` })
                    .orWhere(`${alias}.remark LIKE :search`, { search: `%${filter.search}%` })
                    // Converts the date from database as same format as front display
                    .orWhere(`DATE_FORMAT(${alias}.createdAt, '%d/%m/%Y %H:%i') LIKE :search`, { search:  `%${filter.search}%` })
                    // Converts the user to have the same format as front to match visuals
                    .orWhere(`CONCAT(u.lastname, " ",u.firstname) LIKE :search`, { search: `%${filter.search}%` })
                    // Check if search looks like a translated status
                    .orWhere(`CASE WHEN "${PriceRequestStatusDisplay.CREATED}" LIKE :search THEN ${alias}.status = "CREATED" END`, { search: `%${filter.search}%` })
                    .orWhere(`CASE WHEN "${PriceRequestStatusDisplay.SENT}" LIKE :search THEN ${alias}.status = "SENT" END`, { search: `%${filter.search}%` })
                    .orWhere(`CASE WHEN "${PriceRequestStatusDisplay.ORDERED}" LIKE :search THEN ${alias}.status = "ORDERED" END`, { search: `%${filter.search}%` })
                    .orWhere(`CASE WHEN "${PriceRequestStatusDisplay.PARTIALLY}" LIKE :search THEN ${alias}.status = "PARTIALLY" END`, { search: `%${filter.search}%` })
                    .orWhere("p.reference LIKE :search", { search: `%${filter.search}%` })
                    // If supplyCategory of SupplyList has a parent, check on parent category's name, otherwise check on current category
                    .orWhere(`CASE
                        WHEN psc.id IS NOT NULL THEN psc.name LIKE :search
                        ELSE sc.name LIKE :search
                    END`, { search: `%${filter.search}%` });
            }));
        }
    }

    /**
     * @description Include list sorts into the QueryBuilder
     * @author Quentin Wolfs
     * @protected
     * @param {SelectQueryBuilder<PriceRequestSql>} query
     * @param {PriceRequestSort} sort
     * @param {string} alias
     * @memberof PriceRequestService
     */
    protected processListSorts(query: SelectQueryBuilder<PriceRequestSql>, sort: PriceRequestSort, alias: string): void {
        if (!!sort) {
            query.orderBy(`${alias}.${PriceRequestSortBy[sort.sortBy]}`, sort.sortDirection);
        } else {
            query.orderBy(`${alias}.id`, OrderByDirection.DESC);
        }
    }

    /**
     * @description Save a new PriceRequest in the database
     * @author Quentin Wolfs
     * @param {PriceRequestInput} data
     * @param {number} userId
     * @param {EntityManager} [transaction]
     * @returns {Promise<PriceRequest>}
     * @memberof PriceRequestService
     */
    public async createOne(data: PriceRequestInput, userId: number, transaction?: EntityManager): Promise<PriceRequest> {
        try {
            if (data.supplyListIds) { delete data.supplyListIds; }
            data.userId = userId;
            data.status = PriceRequestStatus.CREATED;

            return super.create(data, transaction);
        } catch (e) {
            throw ErrorUtil.get(e);
        }
    }

    /**
     * @description Get last reference from database
     * @author Quentin Wolfs
     * @param {string} search
     * @returns {Promise<string>}
     * @memberof PriceRequestService
     */
    public async getLastPriceRequestReference(search: string): Promise<string> {
        try {
            const lastPriceRequest = await this._baseRepo.createQueryBuilder()
                .where(`reference LIKE "${search}"`, { search })
                .orderBy("reference", "DESC")
                .limit(1)
                .getOne();

            return lastPriceRequest ? lastPriceRequest.reference : null;
        } catch (e) {
            throw ErrorUtil.get(e);
        }
    }

    /**
     * @description Checks if a PriceRequest is already sent to a Supplier
     * @author Quentin Wolfs
     * @param {number} id
     * @returns {Promise<boolean>}
     * @memberof PriceRequestService
     */
    public async isSentToSupplier(id: number): Promise<boolean> {
        try {
            const result = await this._baseRepo.createQueryBuilder("pr")
                .select(["SUM(so.isSent) AS isSent"])
                .leftJoin("supplierOffers", "so", "pr.id = so.priceRequestId")
                .where("pr.id = :id", { id })
                .getRawOne();

            return result.isSent > 0;
        } catch (e) {
            throw ErrorUtil.get(e);
        }
    }

    /**
     * @description Gets data to determine if a PurchaseOrder can associate/dissociate SupplyList
     * @author Quentin Wolfs
     * @param {number} id
     * @returns {Promise<{ isSentToSupplier: boolean, isOrdered: boolean }>}
     * @memberof PriceRequestService
     */
    public async getDataForUpdateCheck(id: number): Promise<{ isSentToSupplier: boolean, isOrdered: boolean }> {
        try {
            const checkData = await this._baseRepo.createQueryBuilder("pr")
                .select("CASE WHEN SUM(so.isSent) > 0 THEN 1 ELSE 0 END AS isSentToSupplier")
                .addSelect("CASE WHEN COUNT(CASE WHEN po.status != 'CANCELLED' THEN 1 END) > 0 THEN 1 ELSE 0 END AS isOrdered")
                .leftJoin("pr.supplierOffers", "so")
                .leftJoin("so.elements", "soe")
                .leftJoin("soe.purchaseOrderElements", "poe")
                .leftJoin("poe.purchaseOrder", "po")
                .where("pr.id = :id", { id })
                .groupBy("pr.id")
                .getRawOne();

            return {
                isSentToSupplier: checkData && checkData.isSentToSupplier == "1",
                isOrdered: checkData && checkData.isOrdered == "1"
            };
        } catch (err) {
            throw ErrorUtil.get(err);
        }
    }

    /**
     * @description Get all PriceRequestElements that are Amalgams belonging to a given PriceRequest with all data needed
     * @author Quentin Wolfs
     * @param {number} priceRequestId
     * @returns {Promise<PriceRequest[]>}
     * @memberof PriceRequestService
     */
    public async getBarsetResumeData(priceRequestId: number): Promise<PriceRequest> {
        try {
            return await this._baseRepo.createQueryBuilder("pr")
                .leftJoinAndSelect("pr.barsetGeneration", "bg")
                .leftJoinAndSelect("pr.priceRequestElements", "pre", "pre.amalgamGroupId IS NOT NULL")
                .leftJoinAndSelect("pre.amalgamGroup", "ag")
                .leftJoinAndSelect("ag.amalgams", "a")
                .leftJoinAndSelect("a.parts", "ap")
                .leftJoinAndSelect("ap.supplyListElement", "sle")
                .leftJoinAndSelect("sle.supplyList", "sl")
                .leftJoinAndSelect("sl.project", "p")
                .where("pr.id = :id", { id: priceRequestId })
                .getOne();
        } catch (e) {
            throw ErrorUtil.get(e);
        }
    }
}