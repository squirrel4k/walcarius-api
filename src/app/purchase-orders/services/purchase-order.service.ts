import { InjectRepository } from "@nestjs/typeorm";
import { Repository, EntityManager, UpdateResult, Brackets, SelectQueryBuilder } from "typeorm";
import { PurchaseOrderSql } from "../entities/purchase-order.entity";
import { Injectable, BadRequestException } from "@nestjs/common";
import { PurchaseOrderLoader } from "../loaders/purchase-order.loader";
import { PurchaseOrder, PurchaseOrderSort, PurchaseOrderSortBy, PurchaseOrderInput, PurchaseOrderStatus, PurchaseOrderUpdate, PurchaseOrderStatusDisplay, PurchaseOrderFilter } from "../interfaces/purchase-order.interface";
import { ERROR_MESSAGE } from "../../../core/errors/enum/error.enum";
import { BaseSqlService } from "../../../core/services/base-sql.service";
import { SupplierOffer } from "../../price-requests/interfaces/supplier-offer.interface";
import { PdfResult } from "../../pdf/interfaces/pdf.interface";
import { MailerManager } from "../../mailer/managers/mailer.manager";
import { MAIL_TEMPLATES } from "../../mailer/enums/templates.enum";
import { PurchaseOrderByProjectLoader } from "../loaders/purchase-order-by-project.loader";
import { ErrorUtil } from "../../../core/utils/error.util";
import { TotalPriceByPurchaseOrderLoader } from "../loaders/total-price-by-purchase-order.loader";
import { TotalAdditionnalCostByPurchaseOrderLoader } from "../loaders/total-additionnal-cost-by-purchase-order.loader";
import {OrderByDirection, Pagination, PaginationResult} from "../../../core/interfaces/crud.interface";
import { SmtpConfigSql } from "../../smtp-config/entities/smtp-config.entity";
import {PaginationUtil} from "../../../core/utils/pagination.util";

@Injectable()
export class PurchaseOrderService extends BaseSqlService<PurchaseOrderSql, PurchaseOrderInput, PurchaseOrderUpdate> {

    public constructor(
        @InjectRepository(PurchaseOrderSql) purchaseOrderRepo: Repository<PurchaseOrderSql>,
        purchaseOrderLoader: PurchaseOrderLoader,
        private readonly _purchaseOrderByProjectLoader: PurchaseOrderByProjectLoader,
        private readonly _totalPriceByPurchaseOrderLoader: TotalPriceByPurchaseOrderLoader,
        private readonly _totalAdditionnalCostByPurchaseOrderLoader: TotalAdditionnalCostByPurchaseOrderLoader,
        private readonly _mailer: MailerManager
    ) {
        super(purchaseOrderRepo, purchaseOrderLoader, PurchaseOrderSql, true);
    }

    /**
     * @description Includes search string into the QueryBuilder
     * @author Quentin Wolfs
     * @protected
     * @param {SelectQueryBuilder<PurchaseOrderSql>} query
     * @param {PurchaseOrderFilter} filter
     * @param {string} alias
     * @memberof PurchaseOrderService
     */
    protected processListFilters(query: SelectQueryBuilder<PurchaseOrderSql>, filter: PurchaseOrderFilter, alias: string): void {
        if (!!filter) {
            if (filter.search && filter.search.length > 0) {
                // Search on PurchaseOrder Reference & remark
                query.orWhere(`${alias}.reference LIKE :search`, { search: `%${filter.search}%` });
                query.orWhere(`${alias}.remark LIKE :search`, { search: `%${filter.search}%` });

                // Search on Supplier name
                query.leftJoin(`${alias}.supplier`, "s")
                    .orWhere("s.name LIKE :search", { search: `%${filter.search}%` });

                // Search on PurchaseOrder createdAt
                query.orWhere(`DATE_FORMAT(${alias}.createdAt, '%d/%m/%Y %H:%i') LIKE :search`, { search:  `%${filter.search}%` });

                // Search on Creation user name
                query.leftJoin(`${alias}.user`, "u")
                    .orWhere(`CONCAT(u.lastname, " ",u.firstname) LIKE :search`, { search: `%${filter.search}%` });

                // Search on PriceRequest reference
                query.leftJoin(`${alias}.priceRequest`, "pr")
                    .orWhere("pr.reference LIKE :search", { search: `%${filter.search}%` });

                // Search on status
                query.orWhere(`CASE WHEN "${PurchaseOrderStatusDisplay.CREATED}" LIKE :search THEN ${alias}.status = "CREATED" END`, { search: `%${filter.search}%` });
                query.orWhere(`CASE WHEN "${PurchaseOrderStatusDisplay.SENT}" LIKE :search THEN ${alias}.status = "SENT" END`, { search: `%${filter.search}%` });
                query.orWhere(`CASE WHEN "${PurchaseOrderStatusDisplay.CANCELLED}" LIKE :search THEN ${alias}.status = "CANCELLED" END`, { search: `%${filter.search}%` });

                // Search on linked projects
                query.leftJoin(`${alias}.project`, "p")
                    .leftJoin("pr.supplyLists", "sl")
                    .leftJoin("sl.project", "pr_p")
                    .orWhere("p.reference LIKE :search", { search: `%${filter.search}%` })
                    .orWhere("pr_p.reference LIKE :search", { search: `%${filter.search}%` });

            }
        }
    }

    /**
     * @description Includes the PurchaseOrderSort into the QueryBuilder
     * @author Quentin Wolfs
     * @protected
     * @param {SelectQueryBuilder<PurchaseOrderSql>} query
     * @param {PurchaseOrderSort} sort
     * @param {string} alias
     * @memberof PurchaseOrderService
     */
    protected processListSorts(query: SelectQueryBuilder<PurchaseOrderSql>, sort: PurchaseOrderSort, alias: string): void {
        if (sort && sort.sortBy) {
            switch (sort.sortBy) {
                case PurchaseOrderSortBy.ID:
                    query.orderBy(`${alias}.id`, sort.sortDirection || OrderByDirection.DESC);
                    break;
                case PurchaseOrderSortBy.REFERENCE:
                    query.orderBy(`${alias}.reference`, sort.sortDirection || OrderByDirection.DESC);
                    break;
                case PurchaseOrderSortBy.CREATED_AT:
                    query.orderBy(`${alias}.createdAt`, sort.sortDirection || OrderByDirection.DESC);
                    break;
                case PurchaseOrderSortBy.STATUS:
                    query.orderBy(`${alias}.status`, sort.sortDirection || OrderByDirection.DESC);
                    break;
                case PurchaseOrderSortBy.REMARK:
                    query.orderBy(`${alias}.remark`, sort.sortDirection || OrderByDirection.DESC);
                    break;
                case PurchaseOrderSortBy.SUPPLIER:
                    if (query.expressionMap.aliases.every(qAlias => qAlias.type !== "join" || qAlias.name !== "s")) {
                        query.leftJoin(`${alias}.supplier`, "s");
                    }
                    query.orderBy("s.name", sort.sortDirection || OrderByDirection.DESC);
                    break;
                case PurchaseOrderSortBy.PRICE_REQUEST:
                    if (query.expressionMap.aliases.every(qAlias => qAlias.type !== "join" || qAlias.name !== "pr")) {
                        query.leftJoin(`${alias}.priceRequest`, "pr");
                    }
                    query.orderBy("pr.reference", sort.sortDirection || OrderByDirection.DESC);
                    break;
                case PurchaseOrderSortBy.USER:
                    if (query.expressionMap.aliases.every(qAlias => qAlias.type !== "join" || qAlias.name !== "u")) {
                        query.leftJoin(`${alias}.user`, "u");
                    }
                    query.orderBy("u.lastname", sort.sortDirection || OrderByDirection.DESC)
                        .addOrderBy("u.firstname", sort.sortDirection || OrderByDirection.DESC);
            }
        } else {
            query.orderBy(`${alias}.id`, OrderByDirection.DESC);
        }
    }

    /**
     * @description Get last reference from database
     * @author Quentin Wolfs
     * @param {string} search
     * @returns {Promise<string>}
     * @memberof PurchaseOrderService
     */
    public async getLastPurchaseOrderReference(search: string): Promise<string> {
        try {
            const lastPurchaseOrder = await this._baseRepo.createQueryBuilder()
                .where(`reference LIKE "${search}"`, { search })
                .orderBy("reference", "DESC")
                .limit(1)
                .getOne();

            return lastPurchaseOrder ? lastPurchaseOrder.reference : null;
        } catch (e) {
            throw ErrorUtil.get(e);
        }
    }

    /**
     * @description Create a PurchaseOrder from a SupplierOffer
     * @author Quentin Wolfs
     * @param {PurchaseOrderInput} data
     * @param {SupplierOffer} supplierOffer
     * @param {EntityManager} transaction
     * @returns {Promise<PurchaseOrder>}
     * @memberof PurchaseOrderService
     */
    public async createFromSupplierOffer(data: PurchaseOrderInput, supplierOffer: SupplierOffer, transaction: EntityManager): Promise<PurchaseOrder> {
        try {
            data.priceRequestId = supplierOffer.priceRequestId;
            data.supplierId = supplierOffer.supplierId;
            data.supplierContactId = supplierOffer.supplierContactId;

            return await super.create(data, transaction);
        } catch (e) {
            throw ErrorUtil.get(e);
        }
    }

    /**
     * @description Create a new PurchaseOrder from a Project
     * @author Quentin Wolfs
     * @param {PurchaseOrderInput} data
     * @param {EntityManager} transaction
     * @returns {Promise<PurchaseOrder>}
     * @memberof PurchaseOrderService
     */
    public async createFromProject(data: PurchaseOrderInput, transaction: EntityManager): Promise<PurchaseOrder> {
        try {
            return await super.create(data, transaction);
        } catch (e) {
            throw ErrorUtil.get(e);
        }
    }

    /**
     * @description Verifies if a PurchaseOrder is editable
     * @author Quentin Wolfs
     * @param {PurchaseOrder} purchaseOrder
     * @returns {boolean}
     * @memberof PurchaseOrderService
     */
    public isEditable(purchaseOrder: PurchaseOrder): boolean {
        if (!purchaseOrder) {
            throw new BadRequestException(ERROR_MESSAGE.NO_PURCHASE_ORDER);
        } else if (purchaseOrder.sendingDate !== null) {
            throw new BadRequestException(ERROR_MESSAGE.PURCHASE_ORDER_ALREADY_SENT);
        } else if (purchaseOrder.status == PurchaseOrderStatus.CANCELLED) {
            throw new BadRequestException(ERROR_MESSAGE.PURCHASE_ORDER_IS_CANCELLED);
        }
        // Will only get here if no exception was thrown, meaning the PurchaseOrder is editable
        return true;
    }

    /**
     * @description Change Status to "CANCELLED" of a PurchaseOrder
     * @author Quentin Wolfs
     * @param {number} id
     * @param {EntityManager} [transaction]
     * @returns {Promise<boolean>}
     * @memberof PurchaseOrderService
     */
    public async delete(id: number, transaction?: EntityManager): Promise<boolean> {
        try {
            const updateResults: UpdateResult = !!transaction ?
                await transaction.update(this._new, id, { status: PurchaseOrderStatus.CANCELLED }) :
                await this._baseRepo.update(id, { status: PurchaseOrderStatus.CANCELLED });

            return updateResults && updateResults.raw && updateResults.raw.affectedRows > 0;
        } catch (e) {
            throw ErrorUtil.get(e);
        }
    }

    /**
     * @description Get the PurchaseOrder linked to a PurchaseOrderElement
     * @author Quentin Wolfs
     * @param {number} purchaseOrderElementId
     * @param {EntityManager} [transaction]
     * @returns {Promise<PurchaseOrder>}
     * @memberof PurchaseOrderService
     */
    public async getByPurchaseOrderElement(purchaseOrderElementId: number, transaction?: EntityManager): Promise<PurchaseOrder> {
        try {
            const builder = transaction ? transaction.createQueryBuilder(PurchaseOrderSql, "po") : this._baseRepo.createQueryBuilder("po");

            return await builder
                .leftJoin("po.elements", "poe")
                .where("poe.id = :id", { id: purchaseOrderElementId })
                .getOne();
        } catch (e) {
            throw ErrorUtil.get(e);
        }
    }

    /**
     * @description Send mail with PurchaseOrder pdf as attachment to a Supplier
     * @author Quentin Wolfs
     * @param {number} supplierOfferId
     * @param {PdfResult} generatedPdf
     * @param {string} uuid
     * @returns {Promise<boolean>}
     * @memberof PurchaseOrderService
     */
    public async sendPurchaseOrderToSupplier(generatedPdf: PdfResult[], purchaseOrder: PurchaseOrder, lang: string, uuid: string, smtpConfig?: SmtpConfigSql): Promise<boolean> {
        try {
            if (purchaseOrder && purchaseOrder.sendingDate !== null) {
                throw new BadRequestException(ERROR_MESSAGE.PURCHASE_ORDER_ALREADY_SENT);
            }

            const mailSent: boolean = await this.sendMail(purchaseOrder, lang, generatedPdf, smtpConfig);

            return mailSent ? (await this.update(purchaseOrder.id, { status: PurchaseOrderStatus.SENT, sendingDate: new Date() }, uuid)) !== null : mailSent;
        } catch (e) {
            throw ErrorUtil.get(e);
        }
    }

    /**
     * @description Send Purchase Order mail
     * @author Quentin Wolfs
     * @private
     * @param {SupplierOffer} supplierOffer
     * @param {string} lang
     * @param {PdfResult} pdf
     * @returns {Promise<boolean>}
     * @memberof PurchaseOrderService
     */
    private async sendMail(purchaseOrder: PurchaseOrder, lang: string, pdfs: PdfResult[], smtpConfig?: SmtpConfigSql): Promise<boolean> {
        const email: string = purchaseOrder.supplierContact && purchaseOrder.supplierContact.mail ? purchaseOrder.supplierContact.mail : purchaseOrder.supplier.mail;
        if (!email) { throw new BadRequestException(ERROR_MESSAGE.NO_MAIL_FOR_SUPPLIER); }

        return this._mailer.send(
            {
                to: email
            },
            MAIL_TEMPLATES[`PURCHASE_ORDER_${lang.toUpperCase()}`],
            { purchaseOrder },
            pdfs.map((pdf) => ({ path: pdf.path, filename: pdf.fileName })),
            smtpConfig
        );
    }

    /**
     * @description Get all data required for PDF generation
     * @author Quentin Wolfs
     * @param {number} id
     * @returns {Promise<PurchaseOrder>}
     * @memberof PurchaseOrderService
     */
    public async getDataForPurchaseOrderPdf(id: number): Promise<PurchaseOrder> {
        try {
            return await this._baseRepo.createQueryBuilder("po")
                .leftJoinAndSelect("po.project", "p")
                .leftJoinAndSelect("po.supplier", "s")
                .leftJoinAndSelect("po.supplierContact", "sc")
                .leftJoinAndSelect("po.priceRequest", "pr")
                .leftJoinAndSelect("pr.supplierOffers", "so", "so.supplierId = po.supplierId")
                .leftJoinAndSelect("po.additionnalCosts", "poac")
                .leftJoinAndSelect("po.elements", "poe", "poe.deletedAt IS NULL")
                .leftJoinAndSelect("poe.options", "poeo")
                .where("po.id = :id", { id })
                .orderBy("poe.id", "ASC")
                .getOne();
        } catch (e) {
            throw ErrorUtil.get(e);
        }
    }

    /**
     * @description Get all PurchaseOrders related to a project using Dataloader
     * @author Quentin Wolfs
     * @param {number} projectId
     * @param {string} uuid
     * @returns {Promise<PurchaseOrder[]>}
     * @memberof PurchaseOrderService
     */
    public async loadByProject(projectId: number, uuid: string): Promise<PurchaseOrder[]> {
        try {
            return await this._purchaseOrderByProjectLoader.get(uuid).load(projectId);
        } catch (e) {
            throw ErrorUtil.get(e);
        }
    }

    /**
     * @description Get all PurchaseOrders linked to a given Project
     * @author Quentin Wolfs
     * @param {number} projectId
     * @param pagination
     * @returns {Promise<PurchaseOrder[]>}
     * @memberof PurchaseOrderService
     */
    public async getByProject(projectId: number, pagination?: Pagination): Promise<{ data: PurchaseOrder[], pagination: PaginationResult }> {
        try {
            const query = await this._baseRepo.createQueryBuilder("po")
                .leftJoin("po.elements", "poe", "poe.deletedAt IS NULL")
                .leftJoin("poe.supplierOfferElement", "soe")
                .leftJoin("soe.priceRequestElement", "pre")
                .leftJoin("pre.supplyListElement", "pre_sle")
                .leftJoin("pre_sle.supplyList", "pre_sl")
                .leftJoin("pre_sl.project", "pre_p", "pre_p.deletedAt IS NULL")
                .leftJoin("pre.amalgamGroup", "ag")
                .leftJoin("ag.amalgams", "a")
                .leftJoin("a.parts", "ap")
                .leftJoin("ap.supplyListElement", "ap_sle")
                .leftJoin("ap_sle.supplyList", "ap_sl")
                .leftJoin("ap_sl.project", "ap_p", "ap_p.deletedAt IS NULL")
                .where("po.deletedAt IS NULL")
                .andWhere(new Brackets(builder => {
                    builder.where("po.projectId = :id", { id: projectId })
                        .orWhere("pre_p.id = :id", { id: projectId })
                        .orWhere("ap_p.id = :id", { id: projectId });
                }))
                .orderBy("po.reference", "DESC");
            if (pagination) {
                this.addPagination(query, pagination);
            }
            const listResult = await query.getManyAndCount();
            return {
                data: listResult[0],
                pagination: PaginationUtil.createFromCount(pagination, listResult[1])
            };
        } catch (e) {
            throw ErrorUtil.get(e);
        }
    }

    /**
     * @description Get total of all prices in a Purchase Order using DataLoader
     * @author Quentin Wolfs
     * @param {number} id
     * @param {string} uuid
     * @returns {Promise<number>}
     * @memberof PurchaseOrderService
     */
    public async getTotalPrice(id: number, uuid: string): Promise<number> {
        try {
            return this._totalPriceByPurchaseOrderLoader.get(uuid).load(id);
        } catch (e) {
            throw ErrorUtil.get(e);
        }
    }

    /**
     * @description Get total of all additionnal costs of a Purchase Order using DataLoader
     * @author Quentin Wolfs
     * @param {number} id
     * @param {string} uuid
     * @returns {Promise<number>}
     * @memberof PurchaseOrderService
     */
    public async getTotalAdditionnalCosts(id: number, uuid: string): Promise<number> {
        try {
            return this._totalAdditionnalCostByPurchaseOrderLoader.get(uuid).load(id);
        } catch (e) {
            throw ErrorUtil.get(e);
        }
    }
}