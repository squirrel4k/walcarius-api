import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { SupplyCategorySupplierSql } from "../entities/supply-category-supplier.entity";
import { Repository } from "typeorm";
import { ErrorUtil } from "../../../core/utils/error.util";

@Injectable()
export class SupplyCategorySupplierService {

    public constructor (
        @InjectRepository(SupplyCategorySupplierSql) private readonly _supplyCategorySupplierRepo: Repository<SupplyCategorySupplierSql>
    ) { }

    /**
     * @description Get list of all Supplier ID that select the given SupplyCategory
     * @author Quentin Wolfs
     * @param {number} supplyCategoryId
     * @returns {Promise<number[]>}
     * @memberof SupplyCategorySupplierService
     */
    public async getSupplierIds(supplyCategoryId: number): Promise<number[]> {
        try {
            return (await this._supplyCategorySupplierRepo.find({
                select: ["supplierId"],
                where: { supplyCategoryId }
            })).map(res => res.supplierId);
        } catch (e) {
            throw ErrorUtil.get(e);
        }
    }

    /**
     * @description Get list of all SupplyCategory ID that select the given Supplier
     * @author Quentin Wolfs
     * @param {number} supplierId
     * @returns {Promise<number[]>}
     * @memberof SupplyCategorySupplierService
     */
    public async getSupplyCategoryId(supplierId: number): Promise<number[]> {
        try {
            return (await this._supplyCategorySupplierRepo.find({
                select: ["supplyCategoryId"],
                where: { supplierId }
            })).map(res => res.supplyCategoryId);
        } catch (e) {
            throw ErrorUtil.get(e);
        }
    }

    /**
     * @description Delete all links for the given supplier
     * @author Quentin Wolfs
     * @param {number} supplierId
     * @returns {Promise<boolean>}
     * @memberof SupplyCategorySupplierService
     */
    public async deleteBySupplier(supplierId: number): Promise<boolean> {
        try {
            const count: number = await this._supplyCategorySupplierRepo.countBy({ supplierId });

            return count > 0 ?
                (await this._supplyCategorySupplierRepo.delete({ supplierId })).affected == count :
                true;
        } catch (e) {
            throw ErrorUtil.get(e);
        }
    }

    /**
     * @description Create multiple links for the given supplier
     * @author Quentin Wolfs
     * @param {number} supplierId
     * @param {number[]} supplyCategoryIds
     * @returns {Promise<boolean>}
     * @memberof SupplyCategorySupplierService
     */
    public async createMany(supplierId: number, supplyCategoryIds: number[]): Promise<boolean> {
        try {
            const toAdd = supplyCategoryIds.map(id => ({ supplierId, supplyCategoryId: id }));

            return (await this._supplyCategorySupplierRepo.save(toAdd)).length == supplyCategoryIds.length;
        } catch (e) {
            throw ErrorUtil.get(e);
        }
    }
}