import { BaseSqlService } from "../../../core/services/base-sql.service";
import { PurchaseOrderElementSql } from "../entities/purchase-order-element.entity";
import { PurchaseOrderElementInput, PurchaseOrderElementUpdate, PurchaseOrderElement, PurchaseOrderElementFilter, ElementStickerData, StickerInput, SqlStickerData, ElementUnit } from "../interfaces/purchase-order-element.interface";
import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { PurchaseOrderElementLoader } from "../loaders/purchase-order-elements.loader";
import { Repository, EntityManager, IsNull, getConnection, UpdateResult } from "typeorm";
import { PurchaseOrderElementByPurchaseOrderLoader } from "../loaders/purchase-order-element-by-purchase-order.loader";
import { SupplierOfferElement } from "../../price-requests/interfaces/supplier-offer-element.interface";
import { Variant } from "../../price-requests/interfaces/variant.interface";
import { PriceRequestElement, ElementUnitConfig, ElementUnitCategory } from "../../price-requests/interfaces/price-request-element.interface";
import { SelectedSupplierOfferElement } from "../interfaces/purchase-order.interface";
import { ErrorUtil } from "../../../core/utils/error.util";
import { unitConfig } from "../../price-requests/config/unit.config";
import { AmalgamGroup } from "../../price-requests/interfaces/amalgam-group.interface";
import { SupplyListElement } from "../../projects/interfaces/supply-list-element.interface";
import { PurchaseOrderElementOptionService } from "./purchase-order-element-option.service";
import { Pagination } from "../../../core/interfaces/crud.interface";
import { PaginationUtil } from "../../../core/utils/pagination.util";
import { FilterPurchaseOrderElement } from "../interfaces/purchase-order-element.interface";

@Injectable()
export class PurchaseOrderElementService extends BaseSqlService<PurchaseOrderElementSql, PurchaseOrderElementInput, PurchaseOrderElementUpdate> {

    private _unitConfig: ElementUnitConfig;

    public constructor(
        @InjectRepository(PurchaseOrderElementSql) private readonly purchaseOrderElementRepo: Repository<PurchaseOrderElementSql>,
        purchaseOrderElementLoader: PurchaseOrderElementLoader,
        private readonly _purchaseOrderElementByPurchaseOrderLoader: PurchaseOrderElementByPurchaseOrderLoader,
        private readonly _purchaseOrderElementOptionSrv: PurchaseOrderElementOptionService
    ) {
        super (purchaseOrderElementRepo, purchaseOrderElementLoader, PurchaseOrderElementSql, true);
        this._unitConfig = unitConfig;
    }

    /**
     * @description Get the list of all PurchaseOrderElement that matches the filter
     * @author Quentin Wolfs
     * @param {FindConditions<PurchaseOrderElementSql>} filter
     * @returns {Promise<PurchaseOrderElementSql[]>}
     * @memberof PurchaseOrderElementService
     */
    public async getList(filter: PurchaseOrderElementFilter): Promise<PurchaseOrderElementSql[]> {
        return super.getList({ ...filter, deletedAt: IsNull() });
    }

    /**
    * @description Create PurchaseOrderElement From purchaseOrder
    * @author Marie Claudia
    * @param {data} PurchaseOrderElementInput
    * @returns {Promise<PurchaseOrderElement>}
    * @memberof PurchaseOrderElementService
    */
    public async createPurchaseOrderElement(data: PurchaseOrderElementInput): Promise<PurchaseOrderElement> {
        return await getConnection().transaction(async manager => {
            // Create top element
            const element = await this.purchaseOrderElementRepo.save(data);
            return element;
        }).catch(err => { throw ErrorUtil.get(err); });
    }

    /**
    * @description Get all PurchaseOrderElement related to given PurchaseOrder using Dataloader
    * @author Quentin Wolfs
    * @param {number} purchaseOrderId
    * @param {string} uuid
    * @returns {Promise<PurchaseOrderElement[]>}
    * @memberof PurchaseOrderElementService
    */
    public async getByPurchaseOrder(purchaseOrderId: number, uuid: string): Promise<PurchaseOrderElement[]> {
        try {
            return this._purchaseOrderElementByPurchaseOrderLoader.get(uuid).load(purchaseOrderId);
        } catch (e) {
            throw ErrorUtil.get(e);
        }
    }

    /**
    * @description Listing Purchase order Element with pagination and with filter
    * @author Marie Claudia
    * @param {SelectQueryBuilder<T>} query
    * @param {string[]} category
    * @param {Pagination} pagination
    * @memberof BaseSqlService
    */
    public async listFilterPurchaseOrderElement(filterGlobal?:string ,filter?:FilterPurchaseOrderElement, pagination?: Pagination)/*: Promise<{ data: T[], pagination: PaginationResult }>*/ {
        if(filter.category.length == 0){
            return {data:[],pagination: null};
        }else{
            try {

                const query = await this._baseRepo.createQueryBuilder("element")
                    // join bdc
                    .leftJoinAndSelect("element.purchaseOrder", "bdc")
                    // join category c
                    .leftJoin("element.supplyCategory", "_sc")
                    .leftJoin("_sc.parentSupplyCategory", "_psc")
                    .leftJoin("_sc.elementGroup", "_eg")
                    .leftJoinAndSelect("_eg.category", "c")
                    .leftJoin("c.parentCategory", "pc")
                    // join project p
                    .leftJoinAndSelect("element.supplierOfferElement", "_soe")
                    .leftJoinAndSelect("_soe.supplierOffer", "_so")
                    .leftJoinAndSelect("_so.supplier", "_s")
                    .leftJoinAndSelect("_soe.priceRequestElement", "_pre")
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

                //filter global
                if(filterGlobal){
                    query.andWhere(
                        "(" +
                            "element.matterRef    LIKE :filterGlobal OR " +
                            "element.format       LIKE :filterGlobal OR " +
                            "element.weight       LIKE :filterGlobal OR " +
                            "element.length       LIKE :filterGlobal OR " +
                            "element.width        LIKE :filterGlobal OR " +
                            "element.thickness    LIKE :filterGlobal OR " +
                            "element.remark       LIKE :filterGlobal OR " +
                            "element.denomination LIKE :filterGlobal OR " +
                            "element.status       LIKE :filterGlobal OR " +
                            "p.reference          LIKE :filterGlobal OR " +
                            "(ap.reference        LIKE :filterGlobal AND p.reference IS NULL) OR " +
                            "bdc.reference        LIKE :filterGlobal" +
                        ")",
                        {filterGlobal:`%${filterGlobal}%`}
                    )
                }
                
                //checkbox
                query.andWhere("(_sc.name IN (:...category) OR _psc.name IN (:...category) OR c.name IN (:...category) OR pc.name IN (:...category))",{category:filter.category})

                //matière
                if(filter.reference){
                    query.andWhere("element.matterRef LIKE :reference",{reference:`%${filter.reference}%`})
                }  

                //format
                if(filter.format){
                    query.andWhere("element.format LIKE :format",{format:`%${filter.format}%`})
                }

                //poids
                if(filter.poids){
                    query.andWhere("element.weight LIKE :poids",{poids:`%${filter.poids}%`})
                }

                //longueur
                if(filter.long){
                    query.andWhere("element.length LIKE :long",{long:`%${filter.long}%`})
                }

                //largeur
                if(filter.larg){
                    query.andWhere("element.width LIKE :larg",{larg:`%${filter.larg}%`})
                }
                
                //épaisseur
                if(filter.thickness){
                    query.andWhere("element.thickness LIKE :thickness",{thickness:`%${filter.thickness}%`})
                }
                
                //remarque
                if(filter.remarque){
                    query.andWhere("element.remark LIKE :remarque",{remarque:`%${filter.remarque}%`})
                }
                
                //dénomination
                if(filter.denom){
                    query.andWhere("element.denomination LIKE :denom",{denom:`%${filter.denom}%`})
                }

                //statut
                if(filter.status){
                    query.andWhere("element.status LIKE :status",{status:`%${filter.status}%`})
                }

                //référence projet
                if(filter.project){
                    let projectFilterWhere = "p.reference LIKE :project OR (p.reference IS NULL AND ap.reference LIKE :project)";
                    query.andWhere(projectFilterWhere, { project: `%${filter.project}%` })      
                }

                //référence bons de commande
                if(filter.bdc){
                    query.andWhere("bdc.reference LIKE :bdc",{bdc:`%${filter.bdc}%`})
                }

                //date à partir de
                if(filter.dateFrom){
                    query.andWhere("element.createdAt >= :dateFrom", {dateFrom:`${BaseSqlService.formatDate(filter.dateFrom)}`})
                }

                //date jusqu'à
                if(filter.dateTo){
                    filter.dateTo.setHours(23);
                    filter.dateTo.setMinutes(59);
                    filter.dateTo.setSeconds(59);
                    filter.dateTo.setMilliseconds(999);
                    query.andWhere("element.createdAt <= :dateTo", {dateTo:`${BaseSqlService.formatDate(filter.dateTo, true)}`})
                }
                
                query.orderBy('element.createdAt', 'DESC')
                query.distinct();

                this.addPaginationToJoins(query, pagination);

                //this.processListFilters(query, filterGlobal, "element");
                // Execute query and generate pagination result
                const listResult = await query.getManyAndCount();
                const data = listResult[0];
                data.map((el: PurchaseOrderElementSql) => {
                    try {
                        el.supplierName = el.supplierOfferElement?.supplierOffer?.supplier?.name
                        if (el.projectRef === null) {
                            if (el.supplierOfferElement) {
                                const pre = el.supplierOfferElement.priceRequestElement
                                if (pre.amalgamGroup) {
                                    el.projectRef = pre.amalgamGroup.amalgams.shift().parts.shift().supplyListElement.supplyList.project.reference
                                } else {
                                    el.projectRef = pre.supplyListElement.supplyList.project.reference
                                }
                            }
                        }
                    } catch (err) {
                        console.error(err);
                    }
                    return el;
                })
                return {
                    data: data,
                    pagination: PaginationUtil.createFromCount(pagination, listResult[1])
                };
            } catch (err) {
                throw ErrorUtil.get(err);
            }
        }
    }

    public  arrondi(chiffre) {
        if (Number.isInteger(chiffre)) {
            return chiffre;
        } else {
        return parseFloat(chiffre).toFixed(2);
        }
    } 
    /**
    * @description Find a user by its properties
    * @author Marie Claudia
    * @returns
    * @memberof PurchaseOrderElementService
    */
    public async listElement(category: string[]) {
    try {
        return await this.purchaseOrderElementRepo.createQueryBuilder("element")
        .leftJoinAndSelect("element.supplyCategory", "supplyC")
        .leftJoinAndSelect("supplyC.elementGroup","elt")
        .leftJoinAndSelect("elt.category","ctgr")
        .where("ctgr.name IN (:...category)",{category})
    } catch (e) {
        throw ErrorUtil.get(e);
    }
} 

    public async listElementByMatterAndDenomination( matterReference: string, denomination: string) {
        try {
            return await this.purchaseOrderElementRepo.manager.query(`SELECT * FROM purchaseOrderElementsPrice WHERE denomination = '${denomination}' AND matterReference = '${matterReference}';`)
        } catch (e) {
            throw ErrorUtil.get(e);
        }
    } 
    private calculatePriceByMeter(element: any): number {
        switch(element.unit){
            case 'EURO_BY_METER':
                return element.price;
            case 'EURO_BY_TON':
                return (element.price * element.weight / +element.format)
            case 'EURO_BY_UNIT':
                return element.price * 1000 / +element.format
        }
    }

    public async calculateElementPriceByMatterAndDenomination(matterReference: string, denomination: string): Promise<{price: number, supplierName: string}> {
        const elements = await this.listElementByMatterAndDenomination(matterReference, denomination)
        const bestPriceFitElement = elements?.map((element) => {
            const pricePerMeter = this.calculatePriceByMeter(element)
            element.pricePerMeter = pricePerMeter
            return element;
        }).reduce((prev, current) => (prev && prev.pricePerMeter > (current?.pricePerMeter || 0)) ? prev : current, {});
        return {
            price : bestPriceFitElement?.pricePerMeter,
            supplierName: bestPriceFitElement?.supplierName
        };
    }


    /**
    * @description Find a user by its properties
    * @author Marie Claudia
    * @returns
    * @memberof PurchaseOrderElementService
    */
    public async findByCategory(category: string[],pagination: Pagination) {
        try {
            return await this.purchaseOrderElementRepo.createQueryBuilder("element")
            .leftJoinAndSelect("element.supplyCategory", "supplyC")
            .leftJoinAndSelect("supplyC.elementGroup","elt")
            .leftJoinAndSelect("elt.category","ctgr")
            .where("ctgr.name IN (:...category)",{category})
            .getMany()
            .catch(err => { throw ErrorUtil.get(err); });

        } catch (e) {
            throw ErrorUtil.get(e);
        }
    }

    /**
     * @description Update a purchaseOrderElement type with new values
     * @author Marie Claudia
     * @param {number} id
     * @param {PurchaseOrderElementUpdate} data
     * @returns {Promise<PurchaseOrderElement>}
     * @memberof PurchaseOrderElementService
     */
    public async updatePurchaseOrderElement(data: PurchaseOrderElementUpdate, id:number): Promise<PurchaseOrderElement> {
        try { 
            const updated: UpdateResult = await this.purchaseOrderElementRepo.update(id,<PurchaseOrderElementSql>data);
            const element = (updated && updated.raw && updated.raw.affectedRows > 0) ? await this.purchaseOrderElementRepo.findOne(id) : null;
            return element;
        } catch (e) {
            throw ErrorUtil.get(e);
        }
    }

    /**
     * @description Genenerate PurchaseOrderElements from a SupplierOffer's selected elements
     * @author Quentin Wolfs
     * @param {SupplierOfferElement[]} elements
     * @param {number} purchaseOrderId
     * @param {SelectedSupplierOfferElement} selected
     * @param {EntityManager} transaction
     * @returns {Promise<PurchaseOrderElement[]>}
     * @memberof PurchaseOrderElementService
     */
    public async createFromSupplierOffer(elements: SupplierOfferElement[], purchaseOrderId: number, selected: SelectedSupplierOfferElement[], transaction: EntityManager)
    : Promise<PurchaseOrderElement[]> {
        try {
            if (!elements || elements.length == 0 || !selected || selected.length == 0) { return []; }

            const toSave: PurchaseOrderElementInput[] = [];
            selected.forEach(selectedElement => {
                const element = elements.find(soe => soe.id == selectedElement.supplierOfferElementId);
                if (element) { toSave.push(this.formatElementForSave(element, selectedElement.quantity, purchaseOrderId)); }
            });

            return super.createMany(toSave, transaction);
        } catch (e) {
            throw ErrorUtil.get(e);
        }
    }

    /**
     * @description Format a PurchaseOrderElement for save into Database
     * @author Quentin Wolfs
     * @private
     * @param {SupplierOfferElement} element
     * @param {number} quantity
     * @param {number} purchaseOrderId
     * @returns {PurchaseOrderElementInput}
     * @memberof PurchaseOrderElementService
     */
    private formatElementForSave(element: SupplierOfferElement, quantity: number, purchaseOrderId: number): PurchaseOrderElementInput {
        return {
            ...(element.variant ? this.parseFromVariant(element.variant, quantity) : this.parseFromPriceRequestElement(element.priceRequestElement, quantity)),
            quantity,
            deliveryDate: element.deliveryDate,
            price: element.price,
            purchaseOrderId: purchaseOrderId,
            supplierOfferElementId: element.id,
        };
    }

    /**
     * @description Parse data from a Variant into a part of a PurchaseOrderElement
     * @author Quentin Wolfs
     * @private
     * @param {Variant} variant
     * @param {number} quantity
     * @returns {PurchaseOrderElement}
     * @memberof PurchaseOrderElementService
     */
    private parseFromVariant(variant: Variant, quantity: number): PurchaseOrderElement {
        return {
            denomination: variant.reference ? variant.reference : variant.denomination,
            isEn1090: variant.isEn1090,
            isBlack: variant.isBlack,
            isBlasted: variant.isBlasted,
            isPrimaryBlasted: variant.isPrimaryBlasted,
            format: variant.format,
            weight: variant.weight ? (variant.weight / variant.quantity) * quantity : null,
            matterRef: variant.matterRef,
            quantityUnit: variant.quantityUnit,
            thickness: variant.thickness,
            length: variant.length,
            width: variant.width,
            remark: variant.remark,
            supplyCategoryId: variant.supplyCategoryId,
            unit: this.getElementUnit(variant.supplyCategoryId)
        };
    }

    /**
     * @description Parse data from a PriceRequestElement into a part of a PurchaseOrderElement
     * @author Quentin Wolfs
     * @private
     * @param {PriceRequestElement} element
     * @param {number} quantity
     * @returns {PurchaseOrderElement}
     * @memberof PurchaseOrderElementService
     */
    private parseFromPriceRequestElement(element: PriceRequestElement, quantity: number): PurchaseOrderElement {
        return {
            ...(element.amalgamGroup ? this.parseFromAmalgamGroup(element.amalgamGroup) : this.parseFromSupplyListElement(element.supplyListElement)),
            weight: element.weight ? (element.weight / element.quantity) * quantity : null,
            remark: element.remark,
            supplyCategoryId: element.amalgamGroup ? element.amalgamGroup.supplyCategoryId : element.supplyListElement.supplyCategoryId,
            unit: this.getElementUnit(element.amalgamGroup ? element.amalgamGroup.supplyCategoryId : element.supplyListElement.supplyCategoryId)
        };
    }

    /**
     * @description Parse data from an AmalgamGroup into a part of a PurchaseOrderElement
     * @author Quentin Wolfs
     * @private
     * @param {AmalgamGroup} amalgamGroup
     * @returns {Partial<PurchaseOrderElement>}
     * @memberof PurchaseOrderElementService
     */
    private parseFromAmalgamGroup(amalgamGroup: AmalgamGroup): Partial<PurchaseOrderElement> {
        return {
            denomination: amalgamGroup.reference,
            isEn1090: amalgamGroup.isEn1090,
            isBlack: amalgamGroup.isBlack,
            isBlasted: amalgamGroup.isBlasted,
            isPrimaryBlasted: amalgamGroup.isPrimaryBlasted,
            format: amalgamGroup.format,
            matterRef: amalgamGroup.matterRef,
            supplyCategoryId: amalgamGroup.supplyCategoryId,
            unit: this.getElementUnit(amalgamGroup.supplyCategoryId)
        };
    }

    /**
     * @description Parse data from a SupplyListElement into a part of a PurchaseOrderElement
     * @author Quentin Wolfs
     * @private
     * @param {SupplyListElement} supplyListElement
     * @returns {Partial<PurchaseOrderElement>}
     * @memberof PurchaseOrderElementService
     */
    private parseFromSupplyListElement(supplyListElement: SupplyListElement): Partial<PurchaseOrderElement> {
        return {
            denomination: supplyListElement.denomination,
            isEn1090: unitConfig.categories[ElementUnitCategory.PLATES].includes(supplyListElement.supplyCategoryId) ? supplyListElement.supplyList.project.isEn1090 : false,
            matterRef: supplyListElement.matterRef,
            quantityUnit: supplyListElement.quantityUnit,
            thickness: supplyListElement.thickness,
            length: supplyListElement.length,
            width: supplyListElement.width,
            supplyCategoryId: supplyListElement.supplyCategoryId,
            unit: this.getElementUnit(supplyListElement.supplyCategoryId)
        };
    }

    /**
     * @description Returns the element unit of a given supplyCategoryId depending of a set configuration
     * @author Quentin Wolfs
     * @private
     * @param {number} supplyCategoryId
     * @returns
     * @memberof PurchaseOrderElementService
     */
    private getElementUnit(supplyCategoryId: number) {
        let cat: string = Object.keys(this._unitConfig.categories).find(key => this._unitConfig.categories[key].includes(supplyCategoryId));
        cat = cat ? cat : "default";
        return this._unitConfig.units[cat].element;
    }

    /**
     * @description Complete data by injecting projectReferences into PurchaseOrderElements
     * @author Quentin Wolfs
     * @param {number} purchaseOrderId
     * @param {PurchaseOrderElement[]} elements
     * @returns {Promise<PurchaseOrderElement[]>}
     * @memberof PurchaseOrderElementService
     */
    public async completeDataForPurchaseOrderPdf(purchaseOrderId: number, elements: PurchaseOrderElement[]): Promise<PurchaseOrderElement[]> {
        try {
            const referenceByIds = await this._baseRepo.createQueryBuilder("poe")
                .select("DISTINCT poe.id, p.reference AS nonAmalgamProjectRef, ap_p.reference AS amalgamProjectRef")
                .leftJoin("poe.supplierOfferElement", "soe")
                .leftJoin("soe.priceRequestElement", "pre")
                .leftJoin("pre.supplyListElement", "sle")
                .leftJoin("sle.supplyList", "sl")
                .leftJoin("sl.project", "p")
                .leftJoin("pre.amalgamGroup", "ag")
                .leftJoin("ag.amalgams", "a")
                .leftJoin("a.parts", "ap")
                .leftJoin("ap.supplyListElement", "ap_sle")
                .leftJoin("ap_sle.supplyList", "ap_sl")
                .leftJoin("ap_sl.project", "ap_p")
                .where("poe.purchaseOrderId = :id", { id: purchaseOrderId })
                .getRawMany();

            return elements.map(element => {
                const refs: Set<string> = new Set();
                referenceByIds.filter(refById => refById.id == element.id).forEach(refById => {
                    if (refById.nonAmalgamProjectRef) { refs.add(refById.nonAmalgamProjectRef); }
                    if (refById.amalgamProjectRef) { refs.add(refById.amalgamProjectRef); }
                });

                element["projectReferences"] = Array.from(refs);
                return element;
            });
        } catch (e) {
            throw ErrorUtil.get(e);
        }
    }

    /**
     * @description Get all data for Sticker PDF
     * @author Quentin Wolfs
     * @param {StickerInput[]} askedStickers
     * @returns {Promise<ElementStickerData[]>}
     * @memberof PurchaseOrderElementService
     */
    public async getDataForStickerPdf(askedStickers: StickerInput[]): Promise<ElementStickerData[]> {
        const elements: SqlStickerData[] = await this._baseRepo.createQueryBuilder("poe")
            .select("poe.*")
            .addSelect("po.reference AS poReference")
            .addSelect("s.code AS supplier")
            .addSelect("COALESCE(GROUP_CONCAT(DISTINCT ap_p.reference SEPARATOR '||'),GROUP_CONCAT(DISTINCT pre_p.reference SEPARATOR '||'),p.reference) AS projectReferences")
            .addSelect("CASE WHEN soe.variantId IS NOT NULL THEN 1 ELSE 0 END AS isVariant")
            .addSelect("COALESCE(ag.reference, pre_sle.denomination)", "og_reference")
            .addSelect("COALESCE(ag.matterReference, pre_sle.matterReference)", "og_matterRef")
            .addSelect("ag.format", "og_format")
            .addSelect("pre_sle.thickness", "og_thickness")
            .addSelect("pre_sle.length", "og_length")
            .addSelect("pre_sle.width", "og_width")
            .addSelect("ag.isBlack", "og_isBlack")
            .addSelect("ag.isBlasted", "og_isBlasted")
            .addSelect("ag.isPrimaryBlasted", "og_isPrimaryBlasted")
            .addSelect("pre.weight", "og_weight")
            .addSelect("pre.quantity", "og_quantity")
            .addSelect("pre_sle.quantityUnit", "og_quantityUnit")
            .leftJoin("poe.purchaseOrder", "po")
            .leftJoin("po.supplier", "s")
            .leftJoin("po.project", "p")
            .leftJoin("poe.supplierOfferElement", "soe")
            .leftJoin("soe.priceRequestElement", "pre")
            .leftJoin("pre.supplyListElement", "pre_sle")
            .leftJoin("pre_sle.supplyList", "pre_sl")
            .leftJoin("pre_sl.project", "pre_p")
            .leftJoin("pre.amalgamGroup", "ag")
            .leftJoin("ag.amalgams", "a")
            .leftJoin("a.parts", "ap")
            .leftJoin("ap.supplyListElement", "ap_sle")
            .leftJoin("ap_sle.supplyList", "ap_sl")
            .leftJoin("ap_sl.project", "ap_p")
            .where("poe.id IN (:...ids)", { ids: askedStickers.map(asked => asked.purchaseOrderElementId) })
            .groupBy("poe.id")
            .getRawMany();

        return this.formatSqlDataToStickerData(elements, askedStickers);
    }

    /**
     * @description Format Raw data from database for Sticker PDF
     * @author Quentin Wolfs
     * @private
     * @param {SqlStickerData[]} elements
     * @param {StickerInput[]} askedStickers
     * @returns {ElementStickerData[]}
     * @memberof PurchaseOrderElementService
     */
    private formatSqlDataToStickerData(elements: SqlStickerData[], askedStickers: StickerInput[]): ElementStickerData[] {
        return elements.map(element => ({
            id: element.id,
            purchaseOrderReference: element.poReference,
            supplier: element.supplier,
            deliveryDate: element.realDeliveryDate ? element.realDeliveryDate : element.deliveryDate,
            matterRef: element.matterReference,
            elementReference: element.denomination,
            format: element.format,
            quantity: askedStickers.find(asked => asked.purchaseOrderElementId == element.id).quantity,
            weight: +(element.weight / element.quantity).toFixed(2),
            projectReferences: element.projectReferences ? element.projectReferences.split("||") : [],
            isBlack: element.isBlack,
            isBlasted: element.isBlasted,
            isPrimaryBlasted: element.isPrimaryBlasted,
            supplyCategoryId: element.supplyCategoryId,
            thickness: element.thickness,
            length: element.length,
            width: element.width,
            isVariant: element.isVariant === "1",
            og_reference: element.og_reference,
            og_matterRef: element.og_matterRef,
            og_format: element.og_format,
            og_thickness: +element.og_thickness,
            og_length: +element.og_length,
            og_width: +element.og_width,
            og_isBlack: element.og_isBlack === "1",
            og_isBlasted: element.og_isBlasted === "1",
            og_isPrimaryBlasted: element.og_isPrimaryBlasted === "1",
            og_weight:  +(element.og_weight / element.og_quantity).toFixed(2),
            og_quantityUnit: element.og_quantityUnit
        }));
    }

    /**
     * @description Update printed status of a PurchaseOrderElement
     * @author Quentin Wolfs
     * @param {number} id
     * @param {number} quantity
     * @returns {Promise<boolean>}
     * @memberof PurchaseOrderElementService
     */
    public async updatePrintedStatus(id: number, quantity: number): Promise<boolean> {
        const updateResults = await this._baseRepo.createQueryBuilder("poe")
            .update()
            .set({
                printedQuantity: () => `printedQuantity + ${quantity}`,
                isPrinted: true
            })
            .where("id = :id", { id })
            .execute();

        return updateResults && updateResults.raw && updateResults.raw.affectedRows == 1;
    }
}