import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { PriceRequestElementSql } from "../entities/price-request-element.entity";
import { SupplierOfferElementSql } from "../entities/supplier-offer-element.entity";
import { Repository, In, IsNull, Not, Brackets, EntityManager } from "typeorm";
import { SupplyListElementSql } from "../../projects/entities/supply-list-element.entity";
import { PriceRequestElement, PossiblePriceRequestElement, PriceRequestElementUpdate } from "../interfaces/price-request-element.interface";
import { amalgamConfig } from "../config/amalgam.config";
import { AmalgamConfig, AmalgamCategory } from "../interfaces/amalgam.interface";
import { AmalgamGroup } from "../interfaces/amalgam-group.interface";
import { AmalgamGroupService } from "./amalgam-group.service";
import { PriceRequestElementLoader } from "../loaders/price-request-element.loader";
import { WinstonLogger } from "../../common/logger/winston.logger";
import { PriceRequestElementByPriceRequestLoader } from "../loaders/price-request-element-by-price-request.loader";
import { BestPriceByPriceRequestElementLoader } from "../loaders/best-price-by-price-request-element.loader";
import { BestTimeByPriceRequestElementLoader } from "../loaders/best-time-by-price-request-element.loader";
import { PossiblePRElementBySupplierOfferLoader } from "../loaders/possible-price-request-element-by-supplier-offer.loader";
import { ParentSupplyCategoryByPriceRequestElementLoader } from "../loaders/parent-supply-category-by-price-request-element.loader";
import { SupplyCategory } from "../../suppliers/interfaces/supply-category.interface";
import { BaseSqlService } from "../../../core/services/base-sql.service";
import { PriceRequestElementOptionService } from "./price-request-element-option.service";
import { WeightCalculatorManager } from "../managers/weight-calculator.manager";
import { PurchaseOrderQuantityByPriceRequestElementLoader } from "../loaders/purchase-order-quantity-by-price-request-element.loader";
import { ErrorUtil } from "../../../core/utils/error.util";
import { HasPriceByPriceRequestElementLoader } from "../loaders/has-price-by-price-request-element.loader";
import { MatterService } from "../../elements/services/matter.service";
import { PaginationUtil } from "../../../core/utils/pagination.util";
import { FilterPurchaseOrderElement } from "src/app/purchase-orders/interfaces/purchase-order-element.interface";
import { Pagination, PaginationResult } from "src/core/interfaces/crud.interface";

interface InputData {
    amalgamGroup: AmalgamGroup;
    priceRequestElement: PriceRequestElement;
}
@Injectable()
export class PriceRequestElementService extends BaseSqlService<PriceRequestElementSql, PriceRequestElement, PriceRequestElementUpdate> {

    private _amalgamConfig: AmalgamConfig;

    public constructor (
        @InjectRepository(PriceRequestElementSql) priceRequestElementRepo: Repository<PriceRequestElementSql>,
        priceRequestElementLoader: PriceRequestElementLoader,
        private readonly _priceRequestElementByPriceRequestLoader: PriceRequestElementByPriceRequestLoader,
        private readonly _amalgamGroupSrv: AmalgamGroupService,
        private readonly _matterSrv: MatterService,
        private readonly _bestPriceByPriceRequestElementLoader: BestPriceByPriceRequestElementLoader,
        private readonly _bestTimeByPriceRequestElementLoader: BestTimeByPriceRequestElementLoader,
        private readonly _possiblePRElementBySupplierOfferLoader: PossiblePRElementBySupplierOfferLoader,
        private readonly _parentSupplyCategoryByPriceRequestElementLoader: ParentSupplyCategoryByPriceRequestElementLoader,
        private readonly _purchaseOrderQuantityByPriceRequestElementLoader: PurchaseOrderQuantityByPriceRequestElementLoader,
        private readonly _hasPriceByPriceRequestElementLoader: HasPriceByPriceRequestElementLoader,
        private readonly _priceRequestElementOptionSrv: PriceRequestElementOptionService,
        @InjectRepository(SupplierOfferElementSql) private readonly _supplierOfferElementRepo: Repository<SupplierOfferElementSql>,
        private readonly _weightCalculatorMgr: WeightCalculatorManager,
        private readonly _logger: WinstonLogger
    ) {
        super(priceRequestElementRepo, priceRequestElementLoader, PriceRequestElementSql, false);
        this._amalgamConfig = amalgamConfig;
    }

    /**
     * @description Get all PriceRequestElements that belongs to a PriceRequest using DataLoader
     * @author Quentin Wolfs
     * @param {number} priceRequestId
     * @param {string} uuid
     * @returns {Promise<PriceRequestElement[]>}
     * @memberof PriceRequestElementService
     */
    public async getByPriceRequest(priceRequestId: number, uuid: string): Promise<PriceRequestElement[]> {
        try {
            return await this._priceRequestElementByPriceRequestLoader.get(uuid).load(priceRequestId);
        } catch (e) {
            throw ErrorUtil.get(e);
        }
    }

    /**
     * @description Create PriceRequestElements for not-amalgamable SupplyListElements from fiven SupplyLists
     * @author Quentin Wolfs
     * @param {number} priceRequestId
     * @param {number[]} supplyListIds
     * @param {EntityManager} maanger
     * @returns {Promise<PriceRequestElement[]>}
     * @memberof PriceRequestElementService
     */
    public async createForNotAmalgams(priceRequestId: number, supplyListIds: number[], manager: EntityManager): Promise<PriceRequestElement[]> {
        try {
            const slElements = await manager.createQueryBuilder(SupplyListElementSql, "sle").select(["sle.*", "sc.name AS supplyCategoryName"]).leftJoin("supplyCategories", "sc", "sle.supplyCategoryId = sc.id").where("sle.supplyListId IN (:...listIds)", { listIds: supplyListIds }).andWhere("sle.supplyCategoryId NOT IN (:...catIds)", { catIds: this._amalgamConfig.usedCategoryIds }).getRawMany();

            // Create priceRequestElements for each non-amalgamable SLElement
            const prElements = slElements.map(slElement => {
                return { remark: slElement.remark, weight: slElement.weight, quantity: slElement.quantity, supplyListElementId: slElement.id , priceRequestId };
            });

            return manager.save(PriceRequestElementSql, prElements);
        } catch (e) {
            throw ErrorUtil.get(e);
        }
    }

        /**
     * @description Update PriceRequestElements for not-amalgamable SupplyListElements from fiven SupplyLists
     * @author kahlil bennis
     * @param {number} priceRequestId
     * @param {number[]} supplyListIds
     * @param {EntityManager} maanger
     * @returns {Promise<PriceRequestElement[]>}
     * @memberof PriceRequestElementService
     */
        public async updateForNotAmalgams(priceRequestId: number, supplyListIds: number[], manager: EntityManager, uuid: string): Promise<PriceRequestElement[]> {
            try {
                const slElements = await manager.createQueryBuilder(SupplyListElementSql, "sle").select(["sle.*", "sc.name AS supplyCategoryName"]).leftJoin("supplyCategories", "sc", "sle.supplyCategoryId = sc.id").where("sle.supplyListId IN (:...listIds)", { listIds: supplyListIds }).andWhere("sle.supplyCategoryId NOT IN (:...catIds)", { catIds: this._amalgamConfig.usedCategoryIds }).getRawMany();
                const priceRequestElements = await this.getByPriceRequest(priceRequestId, uuid)
                // Create priceRequestElements for each non-amalgamable SLElement
                const alreadyExistingSupplyList = priceRequestElements.map(pre => ({
                    sleId: pre.supplyListElementId,
                    preId: pre.id
                }))
                const prElements = slElements.map(slElement => {
                    const alreadyExistingSuppl = alreadyExistingSupplyList.find(asp => asp.sleId === slElement.id)
                    if (alreadyExistingSuppl) return { id: alreadyExistingSuppl.preId, remark: slElement.remark, weight: slElement.weight, quantity: slElement.quantity, supplyListElementId: slElement.id , priceRequestId };
                    return { remark: slElement.remark, weight: slElement.weight, quantity: slElement.quantity, supplyListElementId: slElement.id , priceRequestId };
                });
    
                return manager.save(PriceRequestElementSql, prElements);
            } catch (e) {
                throw ErrorUtil.get(e);
            }
        }

    /**
     * @description (Hard) delete all PriceRequestElement for not-amalgamable SupplyListElements from given SupplyList
     * @author Quentin Wolfs
     * @param {number} supplyListId
     * @param {EntityManager} manager
     * @returns {Promise<boolean>}
     * @memberof PriceRequestElementService
     */
    public async deleteForNotAmalgams(supplyListId: number, manager: EntityManager): Promise<boolean> {
        try {
            const slElements = await manager.createQueryBuilder(SupplyListElementSql, "sle").select(["sle.*", "sc.name AS supplyCategoryName"]).leftJoin("supplyCategories", "sc", "sle.supplyCategoryId = sc.id").where("sle.supplyListId IN (:...listIds)", { listIds: [supplyListId] }).andWhere("sle.supplyCategoryId NOT IN (:...catIds)", { catIds: this._amalgamConfig.usedCategoryIds }).getRawMany();
            const slElementIds = slElements.map(el => el.id);

            return slElementIds.length > 0 ? (await manager.delete(PriceRequestElementSql, { supplyListElementId: In(slElementIds) })).affected == slElements.length : true;
        } catch (e) {
            throw ErrorUtil.get(e);
        }
    }

    /**
     * @description Create/Delete/Update PriceRequestElements for amalgamable SupplyListElements from given AmalgamGroup
     * @author Quentin Wolfs
     * @param {number} priceRequestId
     * @param {AmalgamGroup[]} amalgamGroups
     * @param {EntityManager} transaction
     * @returns {Promise<PriceRequestElement[]>}
     * @memberof PriceRequestElementService
     */
    public async associateForAmalgamGroups(priceRequestId: number, amalgamGroups: AmalgamGroup[], transaction: EntityManager): Promise<PriceRequestElement[]> {
        try {
            const databasePRE = await transaction.find(PriceRequestElementSql, { where: { priceRequestId, amalgamGroupId: Not(IsNull()) } });
            const countByGroup = await this._amalgamGroupSrv.getAmalgamCountByGroup(amalgamGroups, transaction);

            const { toCreate, toUpdate, toDelete, alreadyValid } = this.filterPriceRequestElements(priceRequestId, databasePRE, amalgamGroups, countByGroup);
            const saved = toCreate.length > 0 ? await this.recursivelyCreate(toCreate, transaction) : [];
            const updated = toUpdate.length > 0 ? await this.updateMany(toUpdate, transaction) : [];

            // Delete unused PriceRequestElements
            const deleteIds: number[] = toDelete.map(pre => pre.id);
            const isDeleted = toDelete.length > 0 ? await this.deleteByIds(deleteIds, transaction) : true;
            if (!isDeleted) { this._logger.warn(`Could not delete following PriceRequestElements [${deleteIds.join(", ")}]`); }

            return [...saved, ...updated, ...alreadyValid];
        } catch (e) {
            throw ErrorUtil.get(e);
        }
    }

    /**
     * @description Delete multiple PriceRequestElement and their related PriceRequestElementOption by their ID
     * @author Quentin Wolfs
     * @param {number[]} deleteIds
     * @param {EntityManager} [transaction]
     * @returns {Promise<boolean>}
     * @memberof PriceRequestElementService
     */
    public async deleteByIds(deleteIds: number[], transaction?: EntityManager): Promise<boolean> {
        try {
            const optionDeleted = await this._priceRequestElementOptionSrv.deleteBy({ priceRequestElementId: In(deleteIds) }, transaction);
            const soeCond = { priceRequestElementId: In(deleteIds) };
            const soeCount = transaction
                ? await transaction.countBy(SupplierOfferElementSql, soeCond)
                : await this._supplierOfferElementRepo.countBy(soeCond);
            const offersDeleted = soeCount === 0 || (transaction
                ? (await transaction.delete(SupplierOfferElementSql, soeCond)).affected === soeCount
                : (await this._supplierOfferElementRepo.delete(soeCond)).affected === soeCount);
            if (!optionDeleted) { this._logger.warn(`Could not delete following PriceRequestElementOptions for PriceRequestElements [${deleteIds.join(", ")}]`); }

            return optionDeleted && offersDeleted && await super.deleteBy({ id: In(deleteIds) }, transaction);
        } catch (e) {
            throw ErrorUtil.get(e);
        }
    }

    /**
     * @description Recursively create all PriceRequestElement with their Options
     * @author Quentin Wolfs
     * @private
     * @param {InputData[]} data
     * @param {EntityManager} transaction
     * @returns {Promise<PriceRequestElement[]>}
     * @memberof PriceRequestElementService
     */
    private async recursivelyCreate(data: InputData[], transaction: EntityManager): Promise<PriceRequestElement[]> {
        try {
            if (data.length === 0) { return []; }

            const current = data.shift();
            const matters = await this._matterSrv.getBy({}, transaction);
            const weight = await this._weightCalculatorMgr.getWeight(current.amalgamGroup, matters, transaction);
            const created = await super.create({ ...current.priceRequestElement, weight: weight * current.priceRequestElement.quantity }, transaction);
            const options = await this._priceRequestElementOptionSrv.prepareForNewPriceRequestElement(created.id, current.amalgamGroup, transaction);
            if (options.length > 0) {
                created.options = await this._priceRequestElementOptionSrv.createMany(options, transaction);
            }

            return [created, ...await this.recursivelyCreate(data, transaction)];
        } catch (e) {
            throw ErrorUtil.get(e);
        }
    }

    /**
     * @description Filters PriceRequestElements into Create / Update / Delete arrays
     * @author Quentin Wolfs
     * @private
     * @param {number} priceRequestId
     * @param {PriceRequestElement[]} databasePRE
     * @param {AmalgamGroup[]} amalgamGroups
     * @param {any[]} countByAmalgamGroup
     * @returns {{ toCreate: InputData[], toUpdate: PriceRequestElementUpdate[], toDelete: PriceRequestElement[] }}
     * @memberof PriceRequestElementService
     */
    private filterPriceRequestElements(priceRequestId: number, databasePRE: PriceRequestElement[], amalgamGroups: AmalgamGroup[], countByAmalgamGroup: any[])
    : { toCreate: InputData[], toUpdate: PriceRequestElementUpdate[], toDelete: PriceRequestElement[], alreadyValid: PriceRequestElement[] } {
        const toCreate: InputData[] = [];
        const toUpdate: PriceRequestElementUpdate[] = [];
        const alreadyValid = [];

        amalgamGroups.forEach(group => {
            const foundPRE = databasePRE.find(pre => pre.amalgamGroupId === group.id);
            const quantity = countByAmalgamGroup.find(count => count.id === group.id).quantity;
            // If no PRE found with this specific amalgamGroupId, create it
            if (!foundPRE) {
                toCreate.push({
                    amalgamGroup: group,
                    priceRequestElement: { remark: group.remark, quantity, amalgamGroupId: group.id, priceRequestId }
                });
            // If PRE was found, if quantity is the same, it's already good, otherwise need to update it
            } else {
                foundPRE.quantity == quantity ? alreadyValid.push(foundPRE) : toUpdate.push({
                    id: foundPRE.id,
                    quantity,
                    weight: (foundPRE.weight / foundPRE.quantity) * quantity,
                    remark: group.remark
                });
            }
        });
        // Delete unused PRE
        const toDelete: PriceRequestElement[] = databasePRE.filter(pre => {
            return toUpdate.findIndex((el => el.id == pre.id)) === -1
                && alreadyValid.findIndex((el => el.id == pre.id)) === -1;
        });

        return { toCreate, toUpdate, toDelete, alreadyValid };
    }

    /**
     * @description Get all possible PriceRequestElement (PRE that matches the SupplyCategories of a Supplier) for a SupplierOffer
     * @author Quentin Wolfs
     * @param {number} supplierOfferId
     * @param {string} uuid
     * @returns {Promise<PossiblePriceRequestElement[]>}
     * @memberof PriceRequestElementService
     */
    public async getPossiblePriceRequestElementByOffer(supplierOfferId: number, uuid: string): Promise<PossiblePriceRequestElement[]> {
        try {
            return this._possiblePRElementBySupplierOfferLoader.get(uuid).load(supplierOfferId);
        } catch (e) {
            throw ErrorUtil.get(e);
        }
    }

    /**
     * @description Get the best price proposed by a Supplier for this PriceRequestElement
     * @author Quentin Wolfs
     * @param {number} id
     * @param {string} uuid
     * @returns {Promise<number>}
     * @memberof PriceRequestElementService
     */
    public async getBestPrice(id: number, uuid: string): Promise<number> {
        try {
            return await this._bestPriceByPriceRequestElementLoader.get(uuid).load(id);
        } catch (e) {
            throw ErrorUtil.get(e);
        }
    }

    /**
     * @description Get the best delivery date proposed by a Supplier for this PriceRequestElement
     * @author Quentin Wolfs
     * @param {number} id
     * @param {string} uuid
     * @returns {Promise<Date>}
     * @memberof PriceRequestElementService
     */
    public async getBestTime(id: number, uuid: string): Promise<Date> {
        try {
            return await this._bestTimeByPriceRequestElementLoader.get(uuid).load(id);
        } catch (e) {
            throw ErrorUtil.get(e);
        }
    }

    /**
     * @description Get all data required for a PriceRequest PDF to send to a Supplier
     * @author Quentin Wolfs
     * @param {number} supplierOfferId
     * @returns {Promise<PriceRequestElement[]>}
     * @memberof PriceRequestElementService
     */
    public async getDataForSupplierPdf(supplierOfferId: number): Promise<PriceRequestElement[]> {
        try {
            let elements: PriceRequestElement[] = await this._baseRepo.createQueryBuilder("pre")
                .addSelect("COALESCE(sle.denomination, ag.reference) AS name_, COALESCE(sle.format, ag.format) AS format_")
                .leftJoin("pre.supplierOfferElements", "soe", "soe.supplierOfferId = :id", { id: supplierOfferId })
                .leftJoin("pre.priceRequest", "pr")
                .leftJoin("pr.supplierOffers", "so")
                .leftJoin("so.supplier", "s")
                .leftJoin("s.supplyCategories", "sc")
                .leftJoinAndSelect("pre.options", "preo")
                .leftJoinAndSelect("pre.supplyListElement", "sle")
                .leftJoinAndSelect("sle.supplyList", "sl")
                .leftJoinAndSelect("sl.project", "p")
                .leftJoinAndSelect("pre.amalgamGroup", "ag")
                .leftJoinAndSelect("ag.amalgams", "a")
                .leftJoinAndSelect("a.parts", "ap")
                .leftJoinAndSelect("ap.supplyListElement", "ap_sle")
                .leftJoinAndSelect("ap_sle.supplyList", "ap_sl")
                .leftJoinAndSelect("ap_sl.project", "ap_p")
                .where("so.id = :id", { id: supplierOfferId })
                .andWhere("(a.isInStock = 0 OR a.isInStock IS NULL)")
                .andWhere(new Brackets(builder => {
                    builder.where("COALESCE(ag.supplyCategoryId, sle.supplyCategoryId) = sc.id")
                        .orWhere("pre.id = soe.priceRequestElementId");
                }))
                .orderBy("name_", "ASC")
                .addOrderBy("format_", "ASC")
                .addOrderBy("pre.id", "ASC")
                .getMany();

            // Edit quantity so we only ask for quantity not already in stock
            elements.forEach(element => {
                if (element.amalgamGroup) {
                    element.quantity = element.amalgamGroup.amalgams.length;
                }
            });

            // Sorts the elements to match the front-end display in the PriceRequest resume
            elements = this.sortPdfElements(elements);

            return this.addProjectReferencesToAmalgamGroups(elements);
        } catch (e) {
            throw ErrorUtil.get(e);
        }
    }

    /**
     * @description Sorts elements to match front-end display in PriceRequest resume array
     * @author Quentin Wolfs
     * @private
     * @param {PriceRequestElement[]} elements
     * @returns {PriceRequestElement[]}
     * @memberof PriceRequestElementService
     */
    private sortPdfElements(elements: PriceRequestElement[]): PriceRequestElement[] {
        const beams: PriceRequestElement[] = [];
        const tubes: PriceRequestElement[] = [];
        const others: PriceRequestElement[] = [];

        elements.forEach(element => {
            const supplyCategoryId: number = element.amalgamGroup ? element.amalgamGroup.supplyCategoryId : element.supplyListElement.supplyCategoryId;
            if (this._amalgamConfig.categoryIds[AmalgamCategory.BEAM].includes(supplyCategoryId)) {
                beams.push(element);
            } else if (this._amalgamConfig.categoryIds[AmalgamCategory.TUBE].includes(supplyCategoryId)) {
                tubes.push(element);
            } else {
                others.push(element);
            }
        });

        return [ ...beams, ...tubes, ...others ];
    }

    /**
     * @description Add an array of Project references to AmalgamGroups. WARNING : Mutates the input array
     * @author Quentin Wolfs
     * @private
     * @param {PriceRequestElement[]} elements
     * @returns {PriceRequestElement[]}
     * @memberof PriceRequestElementService
     */
    private addProjectReferencesToAmalgamGroups(elements: PriceRequestElement[]): PriceRequestElement[] {
        elements.forEach(element => {
            if (element.amalgamGroup !== null) {
                const references: Set<string> = new Set();
                if (element.amalgamGroup.amalgams) {
                    element.amalgamGroup.amalgams.forEach(amalgam => {
                        if (amalgam.parts) {
                            amalgam.parts.forEach(part => {
                                if (part.supplyListElement && part.supplyListElement.supplyList && part.supplyListElement.supplyList.project) {
                                    references.add(part.supplyListElement.supplyList.project.reference);
                                }
                            });
                        }
                    });
                }
                element.amalgamGroup["projectReferences"] = Array.from(references);
            }
        });

        return elements;
    }

    /**
     * @description Get the parent SupplyCategory of a PriceRequestElement's SupplyListElement or AmalgamGroup
     * @author Quentin Wolfs
     * @param {number} id
     * @param {string} uuid
     * @returns {Promise<SupplyCategory>}
     * @memberof PriceRequestElementService
     */
    public async getParentSupplyCategory(id: number, uuid: string): Promise<SupplyCategory> {
        try {
            return await this._parentSupplyCategoryByPriceRequestElementLoader.get(uuid).load(id);
        } catch (e) {
            throw ErrorUtil.get(e);
        }
    }

    /**
     * @description Gets the total quantity of this PriceRequestElement already in a PurchaseOrder
     * @author Quentin Wolfs
     * @param {number} id
     * @param {string} uuid
     * @returns {Promise<number>}
     * @memberof PriceRequestElementService
     */
    public async getPurchaseOrderQuantity(id: number, uuid: string): Promise<number> {
        try {
            return await this._purchaseOrderQuantityByPriceRequestElementLoader.get(uuid).load(id);
        } catch (e) {
            throw ErrorUtil.get(e);
        }
    }

    /**
     * @description Checks whether a PriceRequestElement has at least one encoded price or not using Dataloader
     * @author Quentin Wolfs
     * @param {number} id
     * @param {string} uuid
     * @returns {Promise<boolean>}
     * @memberof PriceRequestElementService
     */
    public async getHasPrice(id: number, uuid: string): Promise<boolean> {
        try {
            return await this._hasPriceByPriceRequestElementLoader.get(uuid).load(id);
        } catch (e) {
            throw ErrorUtil.get(e);
        }
    }

    /**
     * @description Get a list of PriceRequestElements with their complete amalgams (groups, amalgam & parts) for further deleting
     * @author Quentin Wolfs
     * @param {number} priceRequestId
     * @param {EntityManager} transaction
     * @returns {Promise<PriceRequestElement[]>}
     * @memberof PriceRequestElementService
     */
    public async getCompleteElementForPriceRequest(priceRequestId: number, transaction: EntityManager): Promise<PriceRequestElement[]> {
        try {
            return await transaction.createQueryBuilder(PriceRequestElementSql, "pre")
                .leftJoinAndSelect("pre.amalgamGroup", "ag")
                .leftJoinAndSelect("ag.amalgams", "a")
                .leftJoinAndSelect("a.parts", "ap")
                .where("pre.priceRequestId = :priceRequestId", { priceRequestId })
                .getMany();
        } catch (e) {
            throw ErrorUtil.get(e);
        }
    }

    public async listFilterStockElement(filterGlobal?:string ,filter?:FilterPurchaseOrderElement, pagination?: Pagination): Promise<{ data: PriceRequestElementSql[], pagination: PaginationResult }>{
        if(filter.category.length == 0){
            return {data:[],pagination: null};
        }else{
            try {

                const query = await this._baseRepo.createQueryBuilder("_pre")

                    // join project p
                    .leftJoinAndSelect("_pre.supplyListElement", "_sle")
                    .leftJoinAndSelect("_sle.supplyList", "_sl")
                    .leftJoinAndSelect("_sl.project", "p")
                    // join project VIA AMALGAMS ap
                    .leftJoinAndSelect("_pre.amalgamGroup", "_ag")
                    .leftJoinAndSelect("_ag.amalgams", "_a")
                    .leftJoinAndSelect("_a.parts", "_ap")
                    .leftJoinAndSelect("_ap.supplyListElement", "_asle")
                    .leftJoinAndSelect("_asle.supplyList", "_asl")
                    .leftJoinAndSelect("_asl.project", "ap")

                    // join cat by amlgam
                    .leftJoinAndSelect("_ag.element", "_ae")
                    .leftJoinAndSelect("_ae.elementGroup", "_aeg")
                    .leftJoinAndSelect("_aeg.category", "ac")

                    // join categories
                    .leftJoin("_asle.supplyCategory", "_sc")
                    .leftJoin("_sc.parentSupplyCategory", "_psc")
                    .leftJoin("_sc.elementGroup", "_eg")
                    .leftJoinAndSelect("_eg.category", "c")
                    .leftJoin("c.parentCategory", "pc")

                //filter global
                if(filterGlobal){
                    query.andWhere(
                        "(" +
                            "_sle.matterReference    LIKE :filterGlobal OR " +
                            "_sle.format       LIKE :filterGlobal OR " +
                            "_pre.weight       LIKE :filterGlobal OR " +
                            "_sle.length       LIKE :filterGlobal OR " +
                            "_sle.width        LIKE :filterGlobal OR " +
                            "_sle.thickness    LIKE :filterGlobal OR " +
                            "_sle.remark       LIKE :filterGlobal OR " +
                            "_sle.denomination LIKE :filterGlobal OR " +
                            "p.reference          LIKE :filterGlobal OR " +
                            "(ap.reference        LIKE :filterGlobal AND p.reference IS NULL)" +
                        ")",
                        {filterGlobal:`%${filterGlobal}%`}
                    )
                }
                
                //checkbox
                query.andWhere("(_sc.name IN (:...category) OR _psc.name IN (:...category) OR c.name IN (:...category) OR pc.name IN (:...category))",{category:filter.category})

                query.andWhere("_a.isInStock = :isInStock", { isInStock: 1 })

                //matière
                if(filter.reference){
                    query.andWhere("_sle.matterRef LIKE :reference",{reference:`%${filter.reference}%`})
                }  

                //format
                if(filter.format){
                    query.andWhere("_ag.format LIKE :format",{format:`%${filter.format}%`})
                }

                //poids
                if(filter.poids){
                    query.andWhere("_pre.weight LIKE :poids",{poids:`%${filter.poids}%`})
                }

                //longueur
                if(filter.long){
                    query.andWhere("_sle.length LIKE :long",{long:`%${filter.long}%`})
                }

                //largeur
                if(filter.larg){
                    query.andWhere("_sle.width LIKE :larg",{larg:`%${filter.larg}%`})
                }
                
                //épaisseur
                if(filter.thickness){
                    query.andWhere("_sle.thickness LIKE :thickness",{thickness:`%${filter.thickness}%`})
                }
                
                //remarque
                if(filter.remarque){
                    query.andWhere("_sle.remark LIKE :remarque",{remarque:`%${filter.remarque}%`})
                }
                
                //dénomination
                if(filter.denom){
                    query.andWhere("_sle.denomination LIKE :denom",{denom:`%${filter.denom}%`})
                }

                //référence projet
                if(filter.project){
                    let projectFilterWhere = "(p.reference LIKE :project OR (p.reference IS NULL AND ap.reference LIKE :project))";
                    query.andWhere(projectFilterWhere, { project: `%${filter.project}%` })      
                }

                //date à partir de
                if(filter.dateFrom){
                    query.andWhere("_pre.createdAt >= :dateFrom", {dateFrom:`${BaseSqlService.formatDate(filter.dateFrom)}`})
                }

                //date jusqu'à
                if(filter.dateTo){
                    filter.dateTo.setHours(23);
                    filter.dateTo.setMinutes(59);
                    filter.dateTo.setSeconds(59);
                    filter.dateTo.setMilliseconds(999);
                    query.andWhere("_pre.createdAt <= :dateTo", {dateTo:`${BaseSqlService.formatDate(filter.dateTo, true)}`})
                }
                
                query.orderBy('_pre.createdAt', 'DESC')

                query.distinct();

                this.addPagination(query, pagination);

                //this.processListFilters(query, filterGlobal, "element");
                // Execute query and generate pagination result
                const listResult = await query.getManyAndCount();
                const data = listResult[0];
                return {
                    data,
                    pagination: PaginationUtil.createFromCount(pagination, listResult[1])
                };
            } catch (e) {
                throw ErrorUtil.get(e);
            }
        }
    }
}
