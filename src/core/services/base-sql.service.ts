import { Repository, FindOptionsWhere, EntityManager, UpdateResult, In, FindManyOptions, SelectQueryBuilder, DeepPartial } from "typeorm";
import { ManyToOneSqlLoader } from "../dataloader/sql/mto-sql.loader";
import { ErrorUtil } from "../utils/error.util";
import { Pagination, Sort, PaginationResult } from "../interfaces/crud.interface";
import { PaginationUtil } from "../utils/pagination.util";
import { QueryDeepPartialEntity } from "typeorm/query-builder/QueryPartialEntity";

/**
 * @description Base SQL Service that takes care of very basic CRUD operations
 * @author Quentin Wolfs
 * @export
 * @class BaseSqlService
 * @template T TypeORM entity of this Service
 * @template C Input interface for this Entity
 * @template U Update interface for this Entity
 */
export class BaseSqlService<T, C, U> {

    /**
     * @author Quentin Wolfs
     * @param {Repository<T>} _baseRepo TypeORM Repository of Entity
     * @param {ManyToOneSqlLoader<T>} _baseLoader Basic Dataloader of Entity
     * @param {ErrorService} _errorSrv
     * @param {new() => T} _new Constructor of Entity
     * @param {boolean} _softDeletable Indicates if the delete should hard or soft delete
     * @memberof BaseSqlService
     */
    public constructor(
        protected readonly _baseRepo: Repository<T>,
        protected readonly _baseLoader: ManyToOneSqlLoader<T>,
        protected _new: new() => T,
        protected _softDeletable: boolean
    ) { }

    /**
     * @description Get an Entity by its ID in a Transaction if extra is an EntityManager, using Dataloader otherwise
     * @author Quentin Wolfs
     * @param {number} id
     * @param {(string | EntityManager)} extra
     * @returns {Promise<T>}
     * @memberof BaseSqlService
     */
    public async getById(id: number, extra: string | EntityManager): Promise<T> {
        try {
            return typeof extra === "string" ?
                await this._baseLoader.get(extra).load(id) :
                await extra.findOneBy(this._new, { id } as unknown as FindOptionsWhere<T>);
        } catch (e) {
            throw ErrorUtil.get(e);
        }
    }

    /**
     * @description Find all Entity matching the given condition
     * @author Quentin Wolfs
     * @param {FindOptionsWhere<T>} condition
     * @param {EntityManager} [transaction]
     * @returns {Promise<boolean>}
     * @memberof BaseSqlService
     */
    public async getBy(condition: FindOptionsWhere<T>, transaction?: EntityManager): Promise<T[]> {
        try {
            return !!transaction ?
                await transaction.find(this._new, { where: condition }) :
                await this._baseRepo.find({ where: condition });
        } catch (e) {
            throw ErrorUtil.get(e);
        }
    }

    /**
     * @description Fine the first Entity matching the given condition
     * @author Quentin Wolfs
     * @param {FindOptionsWhere<T>} condition
     * @param {EntityManager} [transaction]
     * @returns {Promise<T>}
     * @memberof BaseSqlService
     */
    public async getOneBy(condition: FindOptionsWhere<T>, transaction?: EntityManager): Promise<T> {
        try {
            return !!transaction ?
                await transaction.findOneBy(this._new, condition) :
                await this._baseRepo.findOneBy(condition);
        } catch (e) {
            throw ErrorUtil.get(e);
        }
    }

    /**
     * @description Get a list of Entities corresponding to the given filter
     * @author Quentin Wolfs
     * @param {F} filter
     * @param {EntityManager} [transaction]
     * @returns {Promise<T[]>}
     * @memberof BaseSqlService
     */
    public async getList(filter: FindOptionsWhere<T>, order?: { [P in keyof T]?: "ASC" | "DESC" | 1 | -1 }, transaction?: EntityManager): Promise<T[]> {
        try {
            const options: FindManyOptions<T> = {
                where: {},
                order: (order ? order : { }) as any
            };

            if (filter) {
                Object.keys(filter).forEach(filterKey => options.where[filterKey] = filter[filterKey]);
            }

            return !!transaction ?
                transaction.find(this._new, options) :
                this._baseRepo.find(options);
        } catch (e) {
            throw ErrorUtil.get(e);
        }
    }

    /**
     * @description Get data list for front listing
     * @author Quentin Wolfs
     * @template F Filter interface
     * @template S Sort interface
     * @param {F} filter
     * @param {S} sort
     * @param {Pagination} pagination
     * @param {string} [aliad]
     * @returns {Promise<{ data: T[], pagination: PaginationResult }>}
     * @memberof BaseSqlService
     */
    public async frontList<F, S extends Sort>(filter: F, sort: S, pagination: Pagination, alias?: string): Promise<{ data: T[], pagination: PaginationResult }> {
        try {
            alias = alias ? alias : "base";
            const query = this._baseRepo.createQueryBuilder(alias)
                .distinct();

            this.addPagination(query, pagination);

            // Add conditions based on filter - Overridable in child service
            this.processListFilters(query, filter, alias);

            // Sort users - Overridable in child service
            this.processListSorts(query, sort, alias);

            // Execute query and generate pagination result
            const listResult = await query.getManyAndCount();
            return {
                data: listResult[0],
                pagination: PaginationUtil.createFromCount(pagination, listResult[1])
            };
        } catch (err) {
            throw ErrorUtil.get(err);
        }
    }

    /**
     * Convert Date object to format YYY-MM-DD
     * @param date
     * @returns formated date
     */
    public static formatDate(date: Date, withTime: boolean = false): string {
        const dateparts = [
            date.getFullYear(),
            this.pad((date.getMonth()+1), 2),
            this.pad(date.getDate(), 2),
        ];
        const timeparts = [
            this.pad(date.getHours(), 2),
            this.pad(date.getMinutes(), 2),
            this.pad(date.getSeconds(), 2),
        ];

        if (withTime) return dateparts.join('-') + ' ' + timeparts.join(':') + '.' + date.getMilliseconds();
        return dateparts.join('-')
    }

        
    
    /**
    * Force the length of a number by adding leading zero
    * @param num
    * @param size
    * @returns
    */
    public static pad(num, size) {
        num = num.toString();
        while (num.length < size) num = "0" + num;
        return num;
    }

    /**
     * @description Include list filters into the QueryBuilder
     * @author Quentin Wolfs
     * @protected
     * @template F
     * @param {SelectQueryBuilder<T>} query
     * @param {F} filter
     * @param {string} alias
     * @memberof BaseSqlService
     */
    protected processListFilters<F>(query: SelectQueryBuilder<T>, filter: F, alias: string): void { }

    /**
     * @description Include list sorts into the QueryBuilder
     * @author Quentin Wolfs
     * @protected
     * @template S
     * @param {SelectQueryBuilder<T>} query
     * @param {S} sort
     * @param {string} alias
     * @memberof BaseSqlService
     */
    protected processListSorts<S extends Sort>(query: SelectQueryBuilder<T>, sort: S, alias: string): void { }

    /**
     * @description Add Pagination to QueryBuilder
     * @author Quentin Wolfs
     * @protected
     * @param {SelectQueryBuilder<T>} query
     * @param {Pagination} pagination
     * @memberof BaseSqlService
     */
    protected addPagination(query: SelectQueryBuilder<T>, pagination: Pagination): void {
        if (!!pagination) {
            if (pagination.limit) {
                query.limit(pagination.limit);
                if (pagination.page) {
                    query.offset((pagination.page - 1) * pagination.limit);
                }
            }
        }
    }

    protected addPaginationToJoins(query: SelectQueryBuilder<T>, pagination: Pagination): void {
        if (!!pagination) {
            if (pagination.limit) {
                query.take(pagination.limit);
                if (pagination.page) {
                    query.skip((pagination.page - 1) * pagination.limit);
                }
            }
        }
    }

    /**
     * @description Create a new Entity within the database
     * @author Quentin Wolfs
     * @param {C} data
     * @param {EntityManager} [transaction]
     * @returns {Promise<T>}
     * @memberof BaseSqlService
     */
    public async create(data: C, transaction?: EntityManager): Promise<T> {
        try {
            const toSave = this.assign(data);

            return !!transaction ?
                await transaction.save(toSave) :
                await this._baseRepo.save(<DeepPartial<T>>toSave);
        } catch (e) {
            throw ErrorUtil.get(e);
        }
    }

    /**
     * @description Create multiple Entity within the database
     * @author Quentin Wolfs
     * @param {C[]} data
     * @param {EntityManager} [transaction]
     * @returns {Promise<T[]>}
     * @memberof BaseSqlService
     */
    public async createMany(data: C[], transaction?: EntityManager): Promise<T[]> {
        try {
            if (data.length == 0) { return []; }
            const toSave = data.map(shard => this.assign(shard));

            return !!transaction ?
                await transaction.save(toSave) :
                await this._baseRepo.save(<any>toSave)
        } catch (e) {
            throw ErrorUtil.get(e);
        }
    }

    /**
     * @description Update an Entity within the database in a Transaction if extra is an EntityManager
     * @author Quentin Wolfs
     * @param {number} id
     * @param {U} data
     * @param {(string | EntityManager)} extra
     * @returns {Promise<T>}
     * @memberof BaseSqlService
     */
    public async update(id: number, data: U, extra: string | EntityManager): Promise<T> {
        try {
            const toUpdate: QueryDeepPartialEntity<T> = <QueryDeepPartialEntity<T>>this.assign(data);
            
            const updateResults: UpdateResult = typeof extra === "string" ?
                await this._baseRepo.update(id, toUpdate) :
                await extra.update(this._new, id, toUpdate);
            return updateResults && updateResults.raw && updateResults.raw.affectedRows > 0 ? await this.getById(id, extra) : null;
        } catch (e) {
            throw e;
            // throw ErrorUtil.get(e);
        }
    }

    /**
     * @description Update multiple Entities one by one and returns them in bulk
     * @author Quentin Wolfs
     * @param {U[]} data
     * @param {(string | EntityManager)} extra
     * @returns {Promise<T[]>}
     * @memberof BaseSqlService
     */
    public async updateMany(data: U[], extra: string | EntityManager): Promise<T[]> {
        try {
            if (data.length == 0) { return []; }

            const doneUpdating = await this.recursivelyUpdate(data.slice(0), typeof extra !== "string" ? extra : null);

            return typeof extra === "string" ?
                await this._baseLoader.get(extra).load(data.map((shard: any) => shard.id)) :
                this.getBy(<any>{ id: In(data.map((shard: any) => shard.id)) }, extra);
        } catch (e) {
            throw ErrorUtil.get(e);
        }
    }

    /**
     * @description Update multiple Entities one by one and returns confirmation when it's done
     * @author Quentin Wolfs
     * @param {U[]} data
     * @param {EntityManager} [transaction]
     * @returns {Promise<boolean>}
     * @memberof BaseSqlService
     */
    public async updateManyOnlyConfirm(data: U[], transaction?: EntityManager): Promise<boolean> {
        try {
            if (data.length == 0) { return true; }

            return await this.recursivelyUpdate(data.slice(0), transaction);
        } catch (e) {
            throw ErrorUtil.get(e);
        }
    }

    /**
     * @description Recursively updates multiples Entity one by one
     * @author Quentin Wolfs
     * @param {U[]} data
     * @param {EntityManager} [transaction]
     * @returns {Promise<boolean>}
     * @memberof BaseSqlService
     */
    protected async recursivelyUpdate(data: U[], transaction?: EntityManager): Promise<boolean> {
        try {
            if (data.length == 0) { return true; }

            const currentUpdate: QueryDeepPartialEntity<T> = <QueryDeepPartialEntity<T>>this.assign(data.shift());
            const result: UpdateResult = !!transaction ?
                await transaction.update(this._new, (<any>currentUpdate).id, currentUpdate) :
                await this._baseRepo.update((<any>currentUpdate).id, currentUpdate);

            return result.raw && result.raw.affectedRows && result.raw.affectedRows == 1 && await this.recursivelyUpdate(data, transaction);
        } catch (e) {
            throw ErrorUtil.get(e);
        }
    }

    /**
     * @description Update all Entities that matches the search criteria to the given values
     * @author Quentin Wolfs
     * @param {FindOptionsWhere<T>} condition
     * @param {U} data
     * @param {EntityManager} [transaction]
     * @returns {Promise<boolean>}
     * @memberof BaseSqlService
     */
    public async updateBy(condition: FindOptionsWhere<T>, data: U, transaction?: EntityManager): Promise<boolean> {
        try {
            const count = await this._baseRepo.countBy(condition);
            const result: UpdateResult = !!transaction ?
                await transaction.update(this._new, condition, <QueryDeepPartialEntity<T>>data) :
                await this._baseRepo.update(condition, <QueryDeepPartialEntity<T>>data);

            return result.raw && result.raw.affectedRows && result.raw.affectedRows == count;
        } catch (e) {
            throw ErrorUtil.get(e);
        }
    }


    /**
     * @description Delete (softly if possible, hard otherwise) an Entity in the database
     * @author Quentin Wolfs
     * @param {number} id
     * @param {EntityManager} [transaction]
     * @returns {Promise<boolean>}
     * @memberof BaseSqlService
     */
    public async delete(id: number, transaction?: EntityManager): Promise<boolean> {
        return this.deleteHardOrSoft(<any>{ id }, 1, transaction);
    }

    /**
     * @description Delete all Entity matching the given condition
     * @author Quentin Wolfs
     * @param {FindOptionsWhere<T>} condition
     * @param {EntityManager} [transaction]
     * @returns {Promise<boolean>}
     * @memberof BaseSqlService
     */
    public async deleteBy(condition: FindOptionsWhere<T>, transaction?: EntityManager): Promise<boolean> {
        try {
            const count: number = !!transaction ?
                await transaction.countBy(this._new, condition) :
                await this._baseRepo.countBy(condition);
            if (count == 0) { return true; }

            return await this.deleteHardOrSoft(condition, count, transaction);
        } catch (e) {
            throw ErrorUtil.get(e);
        }
    }

    /**
     * @description Delete all Entity matching the given condition using transaction (or not)
     * @author Quentin Wolfs
     * @private
     * @param {FindOptionsWhere<T>} condition
     * @param {number} count
     * @param {EntityManager} [transaction]
     * @returns {Promise<boolean>}
     * @memberof BaseSqlService
     */
    private async deleteHardOrSoft(condition: FindOptionsWhere<T>, count: number, transaction?: EntityManager): Promise<boolean> {
        try {
            if (!!transaction) {
                return this._softDeletable ?
                    (await transaction.update(this._new, condition, <any>{ deletedAt: new Date() })).raw.affectedRows == count :
                    (await transaction.delete(this._new, condition)).affected == count;
            } else {
                return this._softDeletable ?
                    (await this._baseRepo.update(condition, <any>{ deletedAt: new Date() })).raw.affectedRows == count :
                    (await this._baseRepo.delete(condition)).affected == count;
            }
        } catch (e) {
            throw ErrorUtil.get(e);
        }
    }

    /**
     * @description Creates a new Entity based on partial data
     * @author Quentin Wolfs
     * @private
     * @param {(C | U | Partial<T>)} data
     * @returns {T}
     * @memberof BaseSqlService
     */
    private assign(data: C | U | Partial<T>): T {
        return Object.assign(new this._new(), data);
    }
}
