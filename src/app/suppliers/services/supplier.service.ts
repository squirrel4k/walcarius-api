import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { SupplierSql } from "../entities/supplier.entity";
import { Repository, Brackets, EntityManager, SelectQueryBuilder } from "typeorm";
import { Supplier, SupplierInput, SupplierUpdate, SupplierFilter } from "../interfaces/supplier.interface";
import { SupplierLoader } from "../loaders/supplier.loader";
import { SupplierBySupplyCategoryLoader } from "../loaders/supplier-by-supply-category.nature";
import { SupplierInfo } from "../../price-requests/interfaces/supplier-offer.interface";
import { BaseSqlService } from "../../../core/services/base-sql.service";
import { ErrorUtil } from "../../../core/utils/error.util";
import { Matter } from "../../elements/interfaces/matter.interface";
import { MatterBySupplierLoader } from "../loaders/matter-by-supplier.loader";
import { MatterService } from "../../elements/services/matter.service";
import { amalgamConfig } from "../../price-requests/config/amalgam.config";
import { OrderByDirection } from "../../../core/interfaces/crud.interface";

@Injectable()
export class SupplierService extends BaseSqlService<SupplierSql, SupplierInput, SupplierUpdate> {

    public constructor (
        @InjectRepository(SupplierSql) supplierRepo: Repository<SupplierSql>,
        supplierLoader: SupplierLoader,
        private readonly _supplierBySupplyCategoryLoader: SupplierBySupplyCategoryLoader,
        private readonly _matterBySupplierLoader: MatterBySupplierLoader,
        private readonly _matterSrv: MatterService
    ) {
        super(supplierRepo, supplierLoader, SupplierSql, true);
    }

    /**
     * @description Include list filters into the QueryBuilder
     * @author Quentin Wolfs
     * @protected
     * @param {SelectQueryBuilder<SupplierSql>} query
     * @param {SupplierFilter} filter
     * @param {string} alias
     * @memberof SupplierService
     */
    protected processListFilters(query: SelectQueryBuilder<SupplierSql>, filter: SupplierFilter, alias: string): void {
        if (!filter || !filter.isDeleted) {
            query.where(`${alias}.deletedAt IS NULL`);
        }
        if (!!filter && !!filter.search && filter.search.length > 0) {
            query.andWhere(new Brackets(builder => {
                builder.where(`${alias}.name LIKE :search`, { search: `%${filter.search}%` })
                    .orWhere(`${alias}.code LIKE :search`, { search: `%${filter.search}%` });
            }));
        }
    }

    protected processListSorts(query: SelectQueryBuilder<SupplierSql>, filter: any, alias: string): void {
        query.addOrderBy(`${alias}.code`, OrderByDirection.ASC);
    }

    /**
     * @description Lists all Supplier that supply a given SupplyCategory
     * @author Quentin Wolfs
     * @param {number} supplyCategoryId
     * @param {string} uuid
     * @returns {Promise<Supplier[]>}
     * @memberof SupplierService
     */
    public async getListBySupplyCategory(supplyCategoryId: number, uuid: string): Promise<Supplier[]> {
        try {
            return this._supplierBySupplyCategoryLoader.get(uuid).load(supplyCategoryId);
        } catch (e) {
            throw ErrorUtil.get(e);
        }
    }

    /**
     * @description Get favorite SupplierContact ID for each given Supplier ID
     * @author Quentin Wolfs
     * @param {number[]} supplierIds
     * @param {EntityManager} [transaction]
     * @returns {Promise<{ id: number, favoriteId: number }[]>}
     * @memberof SupplierService
     */
    public async getSupplierOfferInfos(supplierIds: number[], transaction?: EntityManager): Promise<SupplierInfo[]> {
        try {
            if (supplierIds.length == 0) { return []; }
            const queryBuilder: SelectQueryBuilder<SupplierSql> = transaction ? transaction.createQueryBuilder(SupplierSql, "s") : this._baseRepo.createQueryBuilder("s");

            return await queryBuilder
                .select(["s.id AS id", "s.code AS code", "sc.id AS favoriteId"])
                .leftJoin("supplierContacts", "sc", "s.id = sc.supplierId")
                .whereInIds(supplierIds)
                .andWhere(new Brackets(builder => {
                    builder.where("sc.isFavorite = 1")
                        .orWhere("sc.id IS NULL");
                }))
                .getRawMany();
        } catch (e) {
            throw ErrorUtil.get(e);
        }
    }

    /**
     * @description Get all suppliers that matches the given supplyLists
     * @author Quentin Wolfs
     * @param {number[]} supplyListIds
     * @param {EntityManager} transaction
     * @returns {Promise<Supplier[]>}
     * @memberof SupplierService
     */
    public async getSuppliersBySupplyLists(supplyListIds: number[], transaction: EntityManager): Promise<Supplier[]> {
        try {
            if (supplyListIds.length == 0) { return []; }
            const matterForAmalgams: Matter[] = await this._matterSrv.getMattersRequiredForAmalgams(supplyListIds, transaction);

            const suppliers = await transaction.createQueryBuilder(SupplierSql, "s")
                .select("s.*")
                .addSelect("GROUP_CONCAT(DISTINCT sle.supplyCategoryId SEPARATOR ',') AS matchedCategoryIds")
                .addSelect("GROUP_CONCAT(DISTINCT m.id SEPARATOR ',') AS amalgamMatterIds")
                .leftJoin("s.matters", "m")
                .leftJoin("supplyCategoriesSuppliers", "scs", "s.id = scs.supplierId")
                .leftJoin("supplyListElements", "sle", "scs.supplyCategoryId = sle.supplyCategoryId")
                .where("s.deletedAt IS NULL")
                .andWhere("sle.supplyListId IN (:...ids)", { ids: supplyListIds })
                .groupBy("s.id")
                .getRawMany();

            // Filters suppliers on their supplied matters if necessary
            suppliers.forEach(supplier => {
                const matchedCategoryIds: number[] = !!supplier.matchedCategoryIds ? supplier.matchedCategoryIds.split(",").map((catId: string) => +catId) : [];
                // Only check matters if ALL matched categories are amalgam-related.
                if (matchedCategoryIds.every(catId => amalgamConfig.usedCategoryIds.indexOf(catId) > -1)) {
                    const supplierMatterIds = !!supplier.amalgamMatterIds ? supplier.amalgamMatterIds.split(",").map((matId: string) => +matId) : [];
                    // If no supplied matters matches the required matters for amalgams, then Supplier is removed from the results
                    if (matterForAmalgams.every(matter => supplierMatterIds.indexOf(matter.id) === -1)) {
                        supplier.deleted = true;
                    }
                }
            });

            return suppliers.filter(sup => !sup.deleted);
        } catch (e) {
            throw ErrorUtil.get(e);
        }
    }

    /**
     * @description Get all suppliers that matches the categories of a PriceRequest
     * @author Quentin Wolfs
     * @param {number} priceRequestId
     * @param {EntityManager} transaction
     * @returns {Promise<Supplier[]>}
     * @memberof SupplierService
     */
    public async getSuppliersByCategoriesOfPriceRequest(priceRequestId: number, transaction: EntityManager): Promise<Supplier[]> {
        try {
            return transaction.createQueryBuilder(SupplierSql, "s")
                .leftJoin("supplyCategoriesSuppliers", "scs", "s.id = scs.supplierId")
                .leftJoin("supplyListElements", "sle", "scs.supplyCategoryId = sle.supplyCategoryId")
                .leftJoin("supplyLists", "sl", "sle.supplyListid = sl.id")
                .where("s.deletedAt IS NULL")
                .andWhere("sl.priceRequestId = :id", { id: priceRequestId })
                .getMany();
        } catch (e) {
            throw ErrorUtil.get(e);
        }
    }

    /**
     * @description Create a new Supplier within the database
     * @author Quentin Wolfs
     * @param {SupplierInput} data
     * @param {EntityManager} [transaction]
     * @returns {Promise<SupplierSql>}
     * @memberof SupplierService
     */
    public async create(data: SupplierInput, transaction?: EntityManager): Promise<SupplierSql> {
        try {
            data.code = data.code.toUpperCase();
            return await super.create(data, transaction);
        } catch (e) {
            throw ErrorUtil.get(e);
        }
    }

    /**
     * @description Get all linked Matters for the selected Supplier using Dataloader
     * @author Quentin Wolfs
     * @param {number} id
     * @param {string} uuid
     * @returns {Promise<Matter[]>}
     * @memberof SupplierService
     */
    public async getMatters(id: number, uuid: string): Promise<Matter[]> {
        try {
            return await this._matterBySupplierLoader.get(uuid).load(id);
        } catch (e) {
            throw ErrorUtil.get(e);
        }
    }
}