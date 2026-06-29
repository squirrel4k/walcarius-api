import { Injectable } from "@nestjs/common";
import { ProjectLoader } from "../loaders/project.loader";
import { InjectRepository } from "@nestjs/typeorm";
import { ProjectSql } from "../entities/project.entity";
import { Repository, Like, FindOptionsWhere, IsNull, SelectQueryBuilder } from "typeorm";
import { Project, ProjectInput, ProjectUpdate, ProjectSort, ProjectFilter } from "../interfaces/project.interface";
import { BaseSqlService } from "../../../core/services/base-sql.service";
import { ErrorUtil } from "../../../core/utils/error.util";
import { ProjectByPurchaseOrderLoader } from "../loaders/project-by-purchase-order.loader";
import { ProjectByPriceRequestLoader } from "../loaders/project-by-price-request.loader";
import { TotalSupplyListByProjectLoader } from "../loaders/total-supply-list-by-project.loader";
import { UnusedSupplyListByProjectLoader } from "../loaders/unused-supply-list-by-project.loader";
import { OrderByDirection } from "../../../core/interfaces/crud.interface";

@Injectable()
export class ProjectService extends BaseSqlService<ProjectSql, ProjectInput, ProjectUpdate> {

    public constructor (
        @InjectRepository(ProjectSql) private readonly projectRepo: Repository<ProjectSql>,
        projectLoader: ProjectLoader,
        private readonly _projectByPurchaseOrderLoader: ProjectByPurchaseOrderLoader,
        private readonly _projectByPriceRequestLoader: ProjectByPriceRequestLoader,
        private readonly _totalSupplyListByProjectLoader: TotalSupplyListByProjectLoader,
        private readonly _unusedSupplyListByProjectLoader: UnusedSupplyListByProjectLoader
    ) {
        super(projectRepo, projectLoader, ProjectSql, true);
    }

    /**
     * @description Get a list of all Projects
     * @author Quentin Wolfs
     * @param {string} search
     * @returns {Promise<Project[]>}
     * @memberof ProjectService
     */
    public async list(search: string): Promise<Project[]> {
        try {
            const where: FindOptionsWhere<ProjectSql> = { deletedAt: IsNull() };
            if (search) { where.reference = Like(`%${search}%`); }

            return super.getList(where, { id: "DESC" });
        } catch (e) {
            throw ErrorUtil.get(e);
        }
    }

    /**
     * @description Include list filters into the QueryBuilder
     * @author Quentin Wolfs
     * @protected
     * @param {SelectQueryBuilder<ProjectSql>} query
     * @param {ProjectFilter} filter
     * @param {string} alias
     * @memberof BaseSqlService
     */
    protected processListFilters(query: SelectQueryBuilder<ProjectSql>, filter: ProjectFilter, alias: string): void {
        query.where(`${alias}.deletedAt IS NULL`);
        if (filter && filter.search) {
            query.andWhere(`${alias}.reference LIKE :search`, { search: `%${filter.search}%` });
        }
    }

    /**
     * @description Include list sorts into the QueryBuilder
     * @author Quentin Wolfs
     * @protected
     * @template S
     * @param {SelectQueryBuilder<ProjectSql>} query
     * @param {S} sort
     * @param {string} alias
     * @memberof BaseSqlService
     */
    protected processListSorts(query: SelectQueryBuilder<ProjectSql>, sort: ProjectSort, alias: string): void {
        query.orderBy(`${alias}.id`, OrderByDirection.DESC);
    }

    /**
     * @description Get all projects linked to a PurchaseOrder, either directly or indirectly, using Dataloader
     * @author Quentin Wolfs
     * @param {number} purchaseOrderId
     * @param {string} uuid
     * @returns {Promise<Project[]>}
     * @memberof ProjectService
     */
    public async getByPurchaseOrder(purchaseOrderId: number, uuid: string): Promise<Project[]> {
        try {
            return this._projectByPurchaseOrderLoader.get(uuid).load(purchaseOrderId);
        } catch (e) {
            throw ErrorUtil.get(e);
        }
    }

    /**
     * @description Get all projects linked to a PriceRequest from its associated Supply List, using Dataloader
     * @author Quentin Wolfs
     * @param {number} priceRequestId
     * @param {string} uuid
     * @returns {Promise<Project[]>}
     * @memberof ProjectService
     */
    public async getByPriceRequest(priceRequestId: number, uuid: string): Promise<Project[]> {
        try {
            return this._projectByPriceRequestLoader.get(uuid).load(priceRequestId);
        } catch (e) {
            throw ErrorUtil.get(e);
        }
    }

    /**
     * @description Get total quantity of registred Supply Lists for a selected Project
     * @author Quentin Wolfs
     * @param {number} projectId
     * @param {string} uuid
     * @returns {Promise<number>}
     * @memberof ProjectService
     */
    public async getTotalSupplyListQuantity(projectId: number, uuid: string): Promise<number> {
        try {
            return this._totalSupplyListByProjectLoader.get(uuid).load(projectId);
        } catch (e) {
            throw ErrorUtil.get(e);
        }
    }

    /**
     * @description Find a project by its properties
     * @author Marie claudia
     * @param {Project} projectProperties
     * @returns
     * @memberof ProjectService
     */
    public async findByProperty(projectProperties: Project){
        try {
            let project =  await this.projectRepo.findOneBy(projectProperties as any);
            return project;
        } catch (e) {
            throw ErrorUtil.get(e);
        }
    }

    /**
     * @description Get total quantity of registred Supply Lists for a selected Project that are NOT assigned to a Price Request
     * @author Quentin Wolfs
     * @param {number} projectId
     * @param {string} uuid
     * @returns {Promise<number>}
     * @memberof ProjectService
     */
    public async getUnusedSupplyListQuantity(projectId: number, uuid: string): Promise<number> {
        try {
            return this._unusedSupplyListByProjectLoader.get(uuid).load(projectId);
        } catch (e) {
            throw ErrorUtil.get(e);
        }
    }
}