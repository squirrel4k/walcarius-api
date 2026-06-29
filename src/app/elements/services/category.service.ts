import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, FindManyOptions } from "typeorm";
import { CategorySql } from "../entities/category.entity";
import { Category } from "../interfaces/category.interface";
import { CategoryLoader } from "../loaders/category.loader";
import { ChildrenCategoryLoader } from "../loaders/children-category.loader";
import { ErrorUtil } from "../../../core/utils/error.util";

@Injectable()
export class CategoryService {

    public constructor (
        @InjectRepository(CategorySql) private readonly _categoryRepo: Repository<CategorySql>,
        private readonly _categoryLoader: CategoryLoader,
        private readonly _childrenCategoryLoader: ChildrenCategoryLoader
    ) { }

    /**
     * @description Get a category by ID
     * @author Quentin Wolfs
     * @param {number} id
     * @param {string} uuid
     * @returns {Promise<Matter>}
     * @memberof CategoryService
     */
    public async getById(id: number, uuid: string): Promise<Category> {
        try {
            return this._categoryLoader.get(uuid).load(id);
        } catch (e) {
            throw ErrorUtil.get(e);
        }
    }

    /**
     * @description List all categories
     * @author Quentin Wolfs
     * @param {number} [parentCategoryId] Only get category which have the given parentCategoryId.
     * @returns {Promise<Category[]>}
     * @memberof CategoryService
     */
    public async categoryList(parentCategoryId?: number): Promise<Category[]> {
        try {
            const options: FindManyOptions = {
                order: { name: "ASC" }
            };
            if (parentCategoryId) { options.where = { parentCategoryId }; }

            return this._categoryRepo.find(options);
        } catch (e) {
            throw ErrorUtil.get(e);
        }
    }

    /**
     * @description Get all chidlren Category which belong to a Category
     * @author Quentin Wolfs
     * @param {number} parentCategoryId
     * @param {string} uuid
     * @returns {Promise<Category[]>}
     * @memberof CategoryService
     */
    public async getChildrenCategories(parentCategoryId: number, uuid: string): Promise<Category[]> {
        try {
            return this._childrenCategoryLoader.get(uuid).load(parentCategoryId);
        } catch (e) {
            throw ErrorUtil.get(e);
        }
    }
}