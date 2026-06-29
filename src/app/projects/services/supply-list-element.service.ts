import { Inject, Injectable, forwardRef } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { SupplyListElementSql } from "../entities/supply-list-element.entity";
import { Repository, In, EntityManager } from "typeorm";
import { SupplyListElementBySupplyListLoader } from "../loaders/supply-list-element-by-supply-list.loader";
import { SupplyListElement, SupplyListElementInput, SupplyListElementUpdate, AmalgamSupplyListElement, QuantityUnit } from "../interfaces/supply-list-element.interface";
import { classToPlain } from "class-transformer";
import { SupplyListElementLoader } from "../loaders/supply-list-element.loader";
import { BaseSqlService } from "../../../core/services/base-sql.service";
import { ErrorUtil } from "../../../core/utils/error.util";
import { ConversionUtil, WeightUnit, VolumeUnit } from "../../../core/utils/conversion.util";
import { amalgamConfig } from "../../price-requests/config/amalgam.config";
import { MatterService } from "../../elements/services/matter.service";
import { unitConfig } from "../../price-requests/config/unit.config";
import { ElementUnitCategory } from "../../price-requests/interfaces/price-request-element.interface";
import { Matter } from "../../elements/interfaces/matter.interface";
import { PriceRequestElementService } from "../../price-requests/services/price-request-element.service";

@Injectable()
export class SupplyListElementService extends BaseSqlService<SupplyListElementSql, SupplyListElementInput, SupplyListElementUpdate> {

    public constructor (
        @InjectRepository(SupplyListElementSql) private readonly supplyListElementRepo: Repository<SupplyListElementSql>,
        supplyListElementLoader: SupplyListElementLoader,
        private readonly _supplyListElementBySupplyListLoader: SupplyListElementBySupplyListLoader,
        private readonly _matterSrv: MatterService,
        @Inject(forwardRef(() => PriceRequestElementService)) private readonly _priceRequestElementSrv: PriceRequestElementService
    ) {
        super(supplyListElementRepo, supplyListElementLoader, SupplyListElementSql, false);
    }

    /**
     * @description Get list of all SupplyListElement related to a SupplyList using Dataloader
     * @author Quentin Wolfs
     * @param {number} SupplyListId
     * @param {string} uuid
     * @returns {Promise<SupplyListElement[]>}
     * @memberof SupplyListElementService
     */
    public async getSupplyListElementsBySupplyList(supplyListId: number, uuid: string): Promise<SupplyListElement[]> {
        try {
            return this._supplyListElementBySupplyListLoader.get(uuid).load(supplyListId);
        } catch (e) {
            throw ErrorUtil.get(e);
        }
    }

    /**
     * @description Get a flat list of all SupplyListElement related to multiple SupplyList using Dataloader
     * @author Quentin Wolfs
     * @param {number[]} supplyListIds
     * @param {string} uuid
     * @returns {Promise<SupplyListElement[]>}
     * @memberof SupplyListElementService
     */
    public async getSupplyListElementForManySupplyLists(supplyListIds: number[], uuid: string): Promise<SupplyListElement[]> {
        try {
            return (await this._supplyListElementBySupplyListLoader.get(uuid).load(supplyListIds)).reduce((a, b) => [...a, ...b]);
        } catch (e) {
            throw ErrorUtil.get(e);
        }
    }

    /**
     * @description Create multiple SupplyListElements within the database
     * @author Quentin Wolfs
     * @param {SupplyListElementInput[]} data
     * @param {EntityManager} [transaction]
     * @returns {Promise<SupplyListElementSql[]>}
     * @memberof SupplyListElementService
     */
    public async createMany(data: SupplyListElementInput[], transaction?: EntityManager): Promise<SupplyListElementSql[]> {
        try {
            const matters = await this._matterSrv.getBy({ }, transaction);
            // Add weight on plates
            data.forEach(element => {
                this.addWeight(element, matters);
                this.fuseQuantityUnit(element);
                this.castFormat(element);
            });

            return super.createMany(data, transaction);
        } catch (e) {
            throw ErrorUtil.get(e);
        }
    }

    /**
     * @description Add weight on element when it's possible
     * @author Quentin Wolfs
     * @private
     * @param {SupplyListElementInput|SupplyListElementUpdate} data
     * @memberof SupplyListElementService
     */
    private addWeight(data: SupplyListElementInput|SupplyListElementUpdate, matters: Matter[]): void {
        if (unitConfig.categories[ElementUnitCategory.PLATES].includes(+data.supplyCategoryId)) {
            switch (data.quantityUnit) {
                case QuantityUnit.KG :
                    data.weight = data.quantity;
                    break;
                case QuantityUnit.TON :
                    data.weight = ConversionUtil.convert(data.quantity, WeightUnit.T, WeightUnit.KG);
                    break;
                case QuantityUnit.UNIT :
                    if (data.matterId) {
                        const volume = ConversionUtil.convert(+data.length * +data.width * +data.thickness, VolumeUnit.MM_3, VolumeUnit.L);
                        const matter = matters.find(mat => mat.id == data.matterId);

                        data.weight = +data.quantity * volume * matter.kgByLiter;
                    }
                    break;
            }
        }
    }

    /**
     * @description Fuse quantityUnit and basicQuantityUnit into the same property
     * @author Quentin Wolfs
     * @private
     * @param {(SupplyListElementInput|SupplyListElementUpdate)} data
     * @memberof SupplyListElementService
     */
    private fuseQuantityUnit(data: SupplyListElementInput|SupplyListElementUpdate): void {
        if (data.basicQuantityUnit) {
            data.quantityUnit = data.basicQuantityUnit;
            delete data.basicQuantityUnit;
        }
    }

    /**
     * @description Cast format if for a amalgamable element to cast commas into dots. (To make them castable into number afterwards)
     * @author Quentin Wolfs
     * @private
     * @param {(SupplyListElementInput|SupplyListElementUpdate)} data
     * @memberof SupplyListElementService
     */
    private castFormat(data: SupplyListElementInput|SupplyListElementUpdate): void {
        if (amalgamConfig.usedCategoryIds.includes(+data.supplyCategoryId)) {
            data.format = data.format.replace(/\,/g, ".");
        }
    }

    /**
     * @description Update/insert/delete all SupplyListElement from a SupplyList based on given elements
     * @author Quentin Wolfs
     * @param {number} supplyListId
     * @param {SupplyListElementUpdate[]} data
     * @param {EntityManager} transaction
     * @returns {Promise<any>}
     * @memberof SupplyListElementService
     */
    public async updateMultiple(supplyListId: number, data: SupplyListElementUpdate[], transaction: EntityManager): Promise<void> {
        try {
            // Get all SupplyListElements for this SupplyList from database
            const baseElements = await super.getBy({ supplyListId }, transaction);
            const matters = await this._matterSrv.getBy({ }, transaction);

            // Separate elements to see what needs to be done with each
            const newElements: any = classToPlain(data);
            const { toCreate, toUpdate, toDelete } = this.separateElements(baseElements, newElements);

            // Create all new entries
            if (toCreate.length > 0) {
                toCreate.forEach(element => element.supplyListId = supplyListId);
                await this.createMany(toCreate, transaction);
            }
            // Update existing entries
            if (toUpdate.length > 0) {
                // Add weight on plates
                toUpdate.forEach(element => {
                    this.addWeight(element, matters);
                    this.fuseQuantityUnit(element);
                    this.castFormat(element);
                });
                await super.updateMany(toUpdate, transaction);
            }
            // Delete removed entries
            if (toDelete.length > 0) {
                const supplyListElements = await this.supplyListElementRepo.find({
                    where: {
                        id: In(toDelete)
                    },
                    relations: ['priceRequestElements']
                })

                const deleted = await this._priceRequestElementSrv.deleteByIds(supplyListElements.flatMap(sle => sle.priceRequestElements).map(p => p.id) || [], transaction)
                if(deleted) {
                    await super.deleteBy({ id: In(toDelete) }, transaction);
                }
            }
        } catch (e) {
            throw ErrorUtil.get(e);
        }
    }

    /**
     * @description Separate a given update array into create / update / delete array depending on what should be done with data
     * @author Quentin Wolfs
     * @private
     * @param {SupplyListElement[]} base
     * @param {SupplyListElementUpdate[]} given
     * @returns {{ toCreate: SupplyListElementUpdate[], toUpdate: SupplyListElementUpdate[], toDelete: number[] }}
     * @memberof SupplyListElementService
     */
    private separateElements(base: SupplyListElement[], given: SupplyListElementUpdate[])
    : { toCreate: SupplyListElementUpdate[], toUpdate: SupplyListElementUpdate[], toDelete: number[] } {
        // Find which ones needs to be deleted
        const toDelete: number[] = base.filter(element => given.findIndex(el => el.id == element.id) == -1).map(element => element.id);

        // Find which ones needs to be created or inserted
        const toCreate: SupplyListElementUpdate[] = [];
        const toUpdate: SupplyListElementUpdate[] = [];
        let baseElement: SupplyListElement;

        given.forEach(element => {
            if (!element.id) {
                toCreate.push(element);
            } else {
                baseElement = base.find(el => el.id == element.id);
                if (!this.areElementEquals(baseElement, element)) { toUpdate.push(element); }
            }
        });

        return { toCreate, toUpdate, toDelete };
    }

    /**
     * @description Verifies if two SupplyListElement have the same values
     * @author Quentin Wolfs
     * @private
     * @param {SupplyListElement} base
     * @param {SupplyListElementUpdate} given
     * @returns {boolean}
     * @memberof SupplyListElementService
     */
    private areElementEquals(base: SupplyListElement, given: SupplyListElementUpdate): boolean {
        return Object.keys(given).every(key => base[key] == given[key]);
    }

    /**
     * @description Get all SupplyListElements that belongs to a PriceRequest
     * @author Quentin Wolfs
     * @param {number} priceRequestId
     * @param {number[]} usedCategoryIds
     * @param {EntityManager} manager
     * @returns {Promise<SupplyListElement[]>}
     * @memberof SupplyListElementService
     */
    public async getSupplyListElementForAmalgam(priceRequestId: number, usedCategoryIds: number[], manager: EntityManager): Promise<AmalgamSupplyListElement[]> {
        try {
            return manager.createQueryBuilder(SupplyListElementSql, "sle")
                .select(["sle.*", "p.isEn1090 AS isEn1090", "eg.icon AS icon", "sle.matterReference AS matterRef", "sl.isAlreadyInBarset AS isAlreadyInBarset"])
                .leftJoin("supplyLists", "sl", "sle.supplyListId = sl.id")
                .leftJoin("projects", "p", "sl.projectId = p.id")
                .leftJoin("supplyCategories", "sc", "sle.supplyCategoryId = sc.id")
                .leftJoin("elementGroups", "eg", "sc.elementGroupId = eg.id")
                .where("sl.priceRequestId = :id", { id: priceRequestId })
                .andWhere("sle.supplyCategoryId IN (:...ids)", { ids: usedCategoryIds })
                .getRawMany();
        } catch (e) {
            throw ErrorUtil.get(e);
        }
    }

    /**
     * @description Get all SupplyListElements that shoud not be in an amalgam from multiple SupplyList
     * @author Quentin Wolfs
     * @param {number[]} supplyListIds
     * @param {number[]} usedCategoryIds
     * @param {EntityManager} manager
     * @returns {Promise<SupplyListElement[]>}
     * @memberof SupplyListElementService
     */
    public async getNonAmalgamElementsFromSupplyLists(supplyListIds: number[], usedCategoryIds: number[], manager: EntityManager): Promise<SupplyListElement[]> {
        try {
            return manager.createQueryBuilder(SupplyListElementSql, "sle")
                .select(["sle.*", "sc.name AS supplyCategoryName"])
                .leftJoin("supplyCategories", "sc", "sle.supplyCategoryId = sc.id")
                .where("sle.supplyListId IN (:...listIds)", { listIds: supplyListIds })
                .andWhere("sle.supplyCategoryId NOT IN (:...catIds)", { catIds: usedCategoryIds })
                .getRawMany();
        } catch (e) {
            throw ErrorUtil.get(e);
        }
    }

    /**
     * @description Counts the number of amalgamable parts a PriceRequest should have
     * @author Quentin Wolfs
     * @param {number} priceRequestId
     * @param {EntityManager} manager
     * @returns {Promise<number>}
     * @memberof SupplyListElementService
     */
    public async getTotalPartsForPriceRequest(priceRequestId: number, manager: EntityManager): Promise<number> {
        try {
            const result = await manager.createQueryBuilder(SupplyListElementSql, "sle")
                .select("SUM(sle.quantity)", "totalParts")
                .leftJoin("sle.supplyList", "sl")
                .where("sle.supplyCategory IN (:...catIds)", { catIds: amalgamConfig.usedCategoryIds })
                .andWhere("sl.priceRequestId = :priceRequestId", { priceRequestId })
                .getRawOne();

            return +result.totalParts || 0;
        } catch (e) {
            throw ErrorUtil.get(e);
        }
    }
}