import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { SupplierContactSql } from "../entities/supplier-contact.entity";
import { Repository, IsNull, Not, EntityManager } from "typeorm";
import { SupplierContact, SupplierContactInput, SupplierContactUpdate, SupplierContactFilter } from "../interfaces/supplier-contact.interface";
import { SupplierContactLoader } from "../loaders/supplier-contact.loader";
import { SupplierContactBySupplierLoader } from "../loaders/supplier-contact-by-supplier.loader";
import { BaseSqlService } from "../../../core/services/base-sql.service";
import { ErrorUtil } from "../../../core/utils/error.util";

@Injectable()
export class SupplierContactService extends BaseSqlService<SupplierContactSql, SupplierContactInput, SupplierContactUpdate> {

    public constructor (
        @InjectRepository(SupplierContactSql) supplierContactRepo: Repository<SupplierContactSql>,
        supplierContactLoader: SupplierContactLoader,
        private readonly _supplierContactBySupplierLoader: SupplierContactBySupplierLoader
    ) {
        super(supplierContactRepo, supplierContactLoader, SupplierContactSql, true);
    }

    /**
     * @description Get list of all SupplierContact related to a Supplier
     * @author Quentin Wolfs
     * @param {number} supplierId
     * @param {boolean} deleted
     * @returns {Promise<SupplierContact[]>}
     * @memberof SupplierContactService
     */
    public async getList(filter: SupplierContactFilter): Promise<SupplierContactSql[]> {
        try {
            filter.deletedAt = IsNull();
            return super.getList(filter as any, { isFavorite: "DESC" } as any);
        } catch (e) {
            throw ErrorUtil.get(e);
        }
    }

    /**
     * @description Get list of all SupplierContact related to a Supplier using Dataloader
     * @author Quentin Wolfs
     * @param {number} supplierId
     * @param {string} uuid
     * @returns {Promise<SupplierContact[]>}
     * @memberof SupplierContactService
     */
    public async getListBySupplier(supplierId: number, uuid: string): Promise<SupplierContact[]> {
        try {
            return this._supplierContactBySupplierLoader.get(uuid).load(supplierId);
        } catch (e) {
            throw ErrorUtil.get(e);
        }
    }

    /**
     * @description Save a new SupplierContact in the database
     * @author Quentin Wolfs
     * @param {SupplierContactInput} data
     * @returns {Promise<SupplierContact>}
     * @memberof SupplierContactService
     */
    public async create(data: SupplierContactInput): Promise<SupplierContactSql> {
        try {
            const count = await this._baseRepo.countBy({ supplierId: data.supplierId, deletedAt: IsNull() });
            data.isFavorite = count == 0;

            return super.create(data);
        } catch (e) {
            throw ErrorUtil.get(e);
        }
    }

    /**
     * @description Set SupplierContact to Favorite for this Supplier
     * @author Quentin Wolfs
     * @param {number} id
     * @param {number} supplierId
     * @param {EntityManager} transaction
     * @returns {Promise<boolean>}
     * @memberof SupplierContactService
     */
    public async setFavorite(id: number, supplierId: number, transaction: EntityManager): Promise<boolean> {
        try {
            // Set the contact to favorite
            const updated = await super.update(id, { isFavorite: true }, transaction);

            if (!!updated) {
                // Set the other contacts of the same supplier to not favorite
                await transaction.update(SupplierContactSql, {
                    id: Not(id),
                    supplierId
                }, { isFavorite: false });
            }

            return !!updated;
        } catch (e) {
            throw ErrorUtil.get(e);
        }
    }
}