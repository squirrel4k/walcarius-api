import { ElementGroup } from "../interfaces/element-group.interface";
import { ElementGroupLoader } from "../loaders/element-group.loader";
import { ElementGroupByCategoryLoader } from "../loaders/element-group-by-category.loader";
import { Injectable } from "@nestjs/common";
import { BaseSqlService } from "../../../core/services/base-sql.service";
import { ElementGroupSql } from "../entities/element-group.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { ErrorUtil } from "../../../core/utils/error.util";

@Injectable()
export class ElementGroupService extends BaseSqlService<ElementGroupSql, null, null> {

    public constructor (
        @InjectRepository(ElementGroupSql) elementGroupRepo: Repository<ElementGroupSql>,
        elementGroupLoader: ElementGroupLoader,
        private readonly _elementGroupByCategoryLoader: ElementGroupByCategoryLoader
    ) {
        super(elementGroupRepo, elementGroupLoader, ElementGroupSql, true);
    }

    /**
     * @description Get all ElementGroup which belong to a Category
     * @author Quentin Wolfs
     * @param {number} categoryId
     * @param {string} uuid
     * @returns
     * @memberof ElementService
     */
    public async getElementGroupByCategory(categoryId: number, uuid: string): Promise<ElementGroup[]> {
        try {
            return this._elementGroupByCategoryLoader.get(uuid).load(categoryId);
        } catch (e) {
            throw ErrorUtil.get(e);
        }
    }
}