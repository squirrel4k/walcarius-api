import { InjectRepository } from "@nestjs/typeorm";
import { ElementSql } from "../entities/element.entity";
import { Repository, Like, IsNull, FindConditions, EntityManager, Brackets } from "typeorm";
import { Element, InputElement, UpdateElement } from "../interfaces/element.interface";
import { NatureService } from "./nature.service";
import { ElementLoader } from "../loaders/element.loader";
import { ElementByElementGroupLoader } from "../loaders/element-by-element-group.loader";
import { Injectable } from "@nestjs/common";
import { BaseSqlService } from "../../../core/services/base-sql.service";
import { ErrorUtil } from "../../../core/utils/error.util";
import { ElementByElementGroupAndMatterLoader } from "../loaders/element-by-element-group-and-matter.loader";

@Injectable()
export class ElementService extends BaseSqlService<ElementSql, InputElement, UpdateElement> {

    public constructor (
        @InjectRepository(ElementSql) elementRepo: Repository<ElementSql>,
        elementLoader: ElementLoader,
        private readonly _natureSrv: NatureService,
        private readonly _elementByElementGroupLoader: ElementByElementGroupLoader,
        private readonly _elementByElementGroupAndMatterLoader: ElementByElementGroupAndMatterLoader
    ) {
        super(elementRepo, elementLoader, ElementSql, true);
    }

    /**
     * @description Search for an element by it's name, can be filtred by elementGroup
     * @author Quentin Wolfs
     * @param {string} search
     * @param {number} elementGroupId
     * @param {number} matterId
     * @returns {Promise<Element[]>}
     * @memberof ElementService
     */
    public async searchElement(search: string, elementGroupId: number, matterId: number): Promise<Element[]> {
        try {
            const where: FindConditions<ElementSql> = {
                name: Like(`%${search}%`),
                deletedAt: IsNull(),
            };
            if (elementGroupId != null) { where.elementGroupId = elementGroupId; }
            if (matterId != null) { where.matterId = matterId; }

            return this._baseRepo.find({ where });
        } catch (e) {
            throw ErrorUtil.get(e);
        }
    }

    /**
     * @description Search for available plate thickness for a particular matter
     * @author Quentin Wolfs
     * @param {number} matterId
     * @param {string} search
     * @returns {Promise<number[]>}
     * @memberof ElementService
     */
    public async searchPlateThickness(matterId: number, search: string): Promise<number[]> {
        try {
            const elements = await this._baseRepo.createQueryBuilder("elements")
                .leftJoinAndSelect("elementGroups", "elg", "elements.elementGroupId = elg.id")
                .leftJoinAndSelect("categories", "cat", "elg.categoryId = cat.id")
                .where("JSON_EXTRACT(elements.natureValues, \"$.Thickness\") LIKE \"%:search%\"", { search: +search })
                .andWhere("elements.matterId = :matterId", { matterId })
                .andWhere("cat.name = :fixed", { fixed: "Tôle" })
                .andWhere("elements.deletedAt IS NULL")
                .getMany();

            return elements.map(el => el.natureValues.Thickness);
        } catch (e) {
            throw ErrorUtil.get(e);
        }
    }

    /**
     * @description Add a new element with nature values in an element group
     * @author Quentin Wolfs
     * @param {InputElement} element
     * @param {string} [uuid]
     * @returns {Promise<ElementSql>}
     * @memberof ElementService
     */
    public async createWithNatureValues(element: InputElement, uuid: string, transaction?: EntityManager): Promise<ElementSql> {
        try {
            const { name, elementGroupId, matterId } = element;
            const natures = await this._natureSrv.getNaturesByElementGroup(element.elementGroupId, uuid);
            const natureValues = this._natureSrv.elementNatureValues(element.natureValues, natures);

            return super.create({ name, elementGroupId, matterId, natureValues }, transaction);
        } catch (e) {
            throw ErrorUtil.get(e);
        }
    }

    /**
     * @description Update an element with nature values in an element group.
     * @author Houtekiet Yves
     * @param {number} id
     * @param {UpdateElement} element
     * @param {string} uuid
     * @returns
     * @memberof ElementService
     */
    public async updateWithNatureValues(id: number, element: UpdateElement, uuid: string): Promise<Element> {
        try {
            const oldElement: Element = await this._baseRepo.findOne(id);
            const elementGroupId: number = oldElement.elementGroupId;
            const natures = await this._natureSrv.getNaturesByElementGroup(elementGroupId, uuid);
            const oldNatureValues = typeof oldElement.natureValues == "string" ? JSON.parse(oldElement.natureValues) : oldElement.natureValues;
            const natureValues = this._natureSrv.elementNatureValues(element.natureValues, natures, oldNatureValues);

            const updated = await this._baseRepo.update(id, { ...oldElement, ...element, natureValues });
            return (updated && updated.raw && updated.raw.affectedRows > 0) ? await this._baseRepo.findOne(id) : null;
        } catch (e) {
            throw ErrorUtil.get(e);
        }
    }

    /**
     * @description Soft deletes an element
     * @author Quentin Wolfs
     * @param {number} id
     * @returns {Promise<boolean>}
     * @memberof ElementService
     */
    public async delete(id: number): Promise<boolean> {
        try {
            const updated = await this._baseRepo.update(id, { deletedAt: new Date().toLocaleString() });

            return updated && updated.raw && updated.raw.affectedRows > 0;
        } catch (e) {
            throw ErrorUtil.get(e);
        }
    }

    /**
     * @description Get all Element which belong to an ElementGroup
     * @author Quentin Wolfs
     * @param {number} elementGroupId The ElementGroup ID.
     * @param {string} uuid
     * @returns
     * @memberof ElementService
     */
    public async getElementByElementGroup(elementGroupId: number, uuid: string): Promise<Element[]> {
        try {
            return this._elementByElementGroupLoader.get(uuid).load(elementGroupId);
        } catch (e) {
            throw ErrorUtil.get(e);
        }
    }

    /**
     * @description Get all elements from requested pairs found in database
     * @author Quentin Wolfs
     * @param {string[]} references
     * @returns {Promise<Element[]>}
     * @memberof ElementService
     */
    public async findElementsFromTekla(references: string[]): Promise<Element[]> {
        try {
            if (references.length === 0) { return []; }
            return this._baseRepo.createQueryBuilder()
                .select(["id", "name", "matterId"])
                .where("deletedAt IS NULL")
                .andWhere("matterId = 1")
                .andWhere(new Brackets(builder => {
                    references.forEach((reference, index) => {
                        builder.orWhere(`name = :name_${index}`, { [`name_${index}`]: reference });
                    });
                }))
                .getRawMany();
        } catch (e) {
            throw ErrorUtil.get(e);
        }
    }

    /**
     * @description Get all Elements belonging to an ElementGroup and matching the given matterId using Dataloader
     * @author Quentin Wolfs
     * @param {number} elementGroupId
     * @param {number} matterId
     * @param {string} uuid
     * @returns {Promise<Element[]>}
     * @memberof ElementService
     */
    public async getByElementGroupAndMatter(elementGroupId: number, matterId: number, uuid: string): Promise<Element[]> {
        try {
            return await this._elementByElementGroupAndMatterLoader.get(uuid).load({ id: elementGroupId, matterId });
        } catch (e) {
            throw ErrorUtil.get(e);
        }
    }
}