import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { SupplyCategorySql } from "../entities/supply-category.entity";
import { Repository, FindConditions } from "typeorm";
import { SupplyCategory, SelectedSupplyCategory, SelectedSupplyCategoryInput } from "../interfaces/supply-category.interface";
import { SupplyCategorySupplierService } from "./supply-category-supplier.service";
import { SupplyCategoryLoader } from "../loaders/supply-category.loader";
import { SubSupplyCategoryLoader } from "../loaders/sub-supply-category.loader";
import { SupplyCategoryBySupplierLoader } from "../loaders/supply-category-by-supplier.loader";
import { ParentSupplyCategoryBySupplierLoader } from "../loaders/parent-supply-category-by-supplier.loader";
import { ParentSupplyCategoryBySupplyListLoader } from "../loaders/parent-supply-category-by-supply-list.loader";
import { NatureBySupplyCategoryLoader } from "../loaders/nature-by-supply-category.loader";
import { Nature } from "../../elements/interfaces/nature.interface";
import { ErrorUtil } from "../../../core/utils/error.util";

@Injectable()
export class SupplyCategoryService {

    public constructor (
        @InjectRepository(SupplyCategorySql) private readonly _supplyCategoryRepo: Repository<SupplyCategorySql>,
        private readonly _supplyCategorySupplierSrv: SupplyCategorySupplierService,
        private readonly _supplyCategoryLoader: SupplyCategoryLoader,
        private readonly _subSupplyCategoryLoader: SubSupplyCategoryLoader,
        private readonly _supplyCategoryBySupplierLoader: SupplyCategoryBySupplierLoader,
        private readonly _parentSupplyCategoryBySupplierLoader: ParentSupplyCategoryBySupplierLoader,
        private readonly _parentSupplyCategoryBySupplyListLoader: ParentSupplyCategoryBySupplyListLoader,
        private readonly _natureBySupplyCategoryLoader: NatureBySupplyCategoryLoader
    ) { }

    /**
     * @description Get a list of all SupplyCategory
     * @author Quentin Wolfs
     * @param {number} parentSupplyCategoryId
     * @returns {Promise<SupplyCategory[]>}
     * @memberof SupplyCategoryService
     */
    public async getList(parentSupplyCategoryId?: number): Promise<SupplyCategory[]> {
        try {
            const where: FindConditions<SupplyCategorySql> = {};
            if (parentSupplyCategoryId !== undefined) { where.parentSupplyCategoryId = parentSupplyCategoryId; }

            return this._supplyCategoryRepo.find({ where });
        } catch (e) {
            throw ErrorUtil.get(e);
        }
    }

    /**
     * @description Get list of all SupplyCategory related to a SupplyCategory using Dataloader
     * @author Quentin Wolfs
     * @param {number} supplierId
     * @param {string} uuid
     * @returns {Promise<SupplyCategory[]>}
     * @memberof SupplyCategoryService
     */
    public async getSubSupplyCategories(supplierId: number, uuid: string): Promise<SupplyCategory[]> {
        try {
            return this._subSupplyCategoryLoader.get(uuid).load(supplierId);
        } catch (e) {
            throw ErrorUtil.get(e);
        }
    }

    /**
     * @description Get a SupplyCategory by its ID
     * @author Quentin Wolfs
     * @param {number} id
     * @param {string} uuid
     * @returns {Promise<SupplyCategory>}
     * @memberof SupplyCategoryService
     */
    public async getById(id: number, uuid: string): Promise<SupplyCategory> {
        try {
            return this._supplyCategoryLoader.get(uuid).load(id);
        } catch (e) {
            throw ErrorUtil.get(e);
        }
    }

    /**
     * @description Get multiple SupplyCategories by their ID
     * @author Quentin Wolfs
     * @param {number[]} ids
     * @param {string} uuid
     * @returns {Promise<SupplyCategory[]>}
     * @memberof SupplyCategoryService
     */
    public async getByIds(ids: number[], uuid: string): Promise<SupplyCategory[]> {
        try {
            return this._supplyCategoryLoader.get(uuid).load(ids);
        } catch (e) {
            throw ErrorUtil.get(e);
        }
    }

    /**
     * @description Get all SupplyCategory and if they are selected by a supplier
     * @author Quentin Wolfs
     * @param {number} supplierId
     * @returns {Promise<SelectedSupplyCategory[]>}
     * @memberof SupplyCategoryService
     */
    public async getSelectedBySupplier(supplierId: number): Promise<SelectedSupplyCategory[]> {
        try {
            const allCategories = await this.getList();
            const supplierCategoryIds = await this._supplyCategorySupplierSrv.getSupplyCategoryId(supplierId);

            return this.formatSelectedSupplyCategories(allCategories, supplierCategoryIds);
        } catch (e) {
            throw ErrorUtil.get(e);
        }
    }

    /**
     * @description Find a  supply Categories by its properties
     * @author Marie Claudia
     * @param {SupplyCategory} supplyCategoriesProperties
     * @returns
     * @memberof SupplyCategoryService
     */
    public async findByProperty(supplyCategoriesProperties: SupplyCategory) {
        try {
            return await this._supplyCategoryRepo.findOne({ where: supplyCategoriesProperties });
        } catch (e) {
            throw ErrorUtil.get(e);
        }
    }

    /**
     * @description Format the SelectedSupplyCategory array
     * @author Quentin Wolfs
     * @private
     * @param {SupplyCategory[]} categories
     * @param {number[]} selectedCategories
     * @returns {SelectedSupplyCategory[]}
     * @memberof SupplyCategoryService
     */
    private formatSelectedSupplyCategories(categories: SupplyCategory[], selectedCategories: number[]): SelectedSupplyCategory[] {
        // Define if each category is selected or not
        const selected: SelectedSupplyCategory[] = categories.map(category => ({
            ...category,
            selected: selectedCategories.indexOf(category.id) > -1,
            subCategories: []
        }));

        // Add Sub categories to their parent array
        selected.forEach(category => {
            const parentCategory = selected.find(cat => cat.id == category.parentSupplyCategoryId);
            if (parentCategory) { parentCategory.subCategories.push(category); }
        });

        // Return only top-level categories
        return selected.filter(category => category.parentSupplyCategoryId == null);
    }

    /**
     * @description Set all selected supply categories for a supplier
     * @author Quentin Wolfs
     * @param {number} supplierId
     * @param {SelectedSupplyCategoryInput[]} data
     * @returns {Promise<boolean>}
     * @memberof SupplyCategoryService
     */
    public async setSelectedForSupplier(supplierId: number, data: SelectedSupplyCategoryInput[]): Promise<boolean> {
        let addLinks: boolean = false;
        const selectedIds = this.getSelectedSupplyCategoryIds(data);
        const deletedLinks = await this._supplyCategorySupplierSrv.deleteBySupplier(supplierId);
        if (deletedLinks) {
            addLinks = await this._supplyCategorySupplierSrv.createMany(supplierId, selectedIds);
        }

        return deletedLinks && addLinks;
    }

    /**
     * @description Split incoming data into two arrays of ids depending on the selected status
     * @author Quentin Wolfs
     * @private
     * @param {SelectedSupplyCategoryInput[]} data
     * @param {number[]} [selected]
     * @param {number[]} [unselected]
     * @returns {{ selected: number[], unselected: number[] }}
     * @memberof SupplyCategoryService
     */
    private getSelectedSupplyCategoryIds(data: SelectedSupplyCategoryInput[], selected?: number[]): number[] {
        if (!selected) { selected = []; }

        data.forEach(category => {
            if (category.selected) { selected.push(category.id); }

            if (category.subCategories && category.subCategories.length > 0) {
                selected = this.getSelectedSupplyCategoryIds(category.subCategories, selected);
            }
        });

        return selected;
    }

    /**
     * @description Get all supplied SupplyCategory of a Supplier
     * @author Quentin Wolfs
     * @param {number} supplierId
     * @param {string} uuid
     * @returns {Promise<SupplyCategory[]>}
     * @memberof SupplyCategoryService
     */
    public async getBySupplier(supplierId: number, uuid: string): Promise<SupplyCategory[]> {
        try {
            return await this._supplyCategoryBySupplierLoader.get(uuid).load(supplierId);
        } catch (e) {
            throw ErrorUtil.get(e);
        }
    }

    /**
     * @description Get all parent SupplyCategory supplied by a Supplier
     * @author Quentin Wolfs
     * @param {number} supplierId
     * @param {string} uuid
     * @returns {Promise<SupplyCategory[]>}
     * @memberof SupplyCategoryService
     */
    public async getParentBySupplier(supplierId: number, uuid: string): Promise<SupplyCategory[]> {
        try {
            return await this._parentSupplyCategoryBySupplierLoader.get(uuid).load(supplierId);
        } catch (e) {
            throw ErrorUtil.get(e);
        }
    }

    /**
     * @description Get all parent SupplyCategory corresponding to a SupplyList
     * @author Quentin Wolfs
     * @param {number} supplyListId
     * @param {string} uuid
     * @returns {Promise<SupplyCategory[]>}
     * @memberof SupplyCategoryService
     */
    public async getParentBySupplyList(supplyListId: number, uuid: string): Promise<SupplyCategory[]> {
        try {
            return await this._parentSupplyCategoryBySupplyListLoader.get(uuid).load(supplyListId);
        } catch (e) {
            throw ErrorUtil.get(e);
        }
    }

    /**
     * @description Load all fields required for a SupplyCategory using Dataloader
     * @author Quentin Wolfs
     * @param {number} supplyListId
     * @param {string} uuid
     * @returns {Promise<Nature[]>}
     * @memberof SupplyCategoryService
     */
    public async getFields(supplyListId: number, uuid: string): Promise<Nature[]> {
        try {
            return await this._natureBySupplyCategoryLoader.get(uuid).load(supplyListId);
        } catch (e) {
            throw ErrorUtil.get(e);
        }
    }
}