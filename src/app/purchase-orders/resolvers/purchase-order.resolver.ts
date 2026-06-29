import { Resolver, Query, Args, ResolveProperty, Parent, Mutation, Context } from "@nestjs/graphql";
import { PurchaseOrderService } from "../services/purchase-order.service";
import { UseInterceptors, BadRequestException } from "@nestjs/common";
import { GqlLoggerInterceptor } from "../../common/interceptors/gql-logger.interceptor";
import { PurchaseOrder, PurchaseOrderSort, PurchaseOrderInput, PurchaseOrderStatus, PurchaseOrderUpdate, PurchaseOrderFromSupplierOfferInput } from "../interfaces/purchase-order.interface";
import { Access } from "../../../core/decorators/access.decorator";
import { GRANT_TOKEN } from "../../common/jwt/jwt.interface";
import { ProjectService } from "../../projects/services/project.service";
import { Project } from "../../projects/interfaces/project.interface";
import { UUID } from "../../../core/decorators/uuid.decorator";
import { Supplier } from "../../suppliers/interfaces/supplier.interface";
import { SupplierService } from "../../suppliers/services/supplier.service";
import { SupplierContactService } from "../../suppliers/services/supplier-contact.service";
import { PriceRequest, PriceRequestStatus } from "../../price-requests/interfaces/price-request.interface";
import { SupplierContact } from "../../suppliers/interfaces/supplier-contact.interface";
import { PriceRequestService } from "../../price-requests/services/price-request.service";
import { Usr } from "../../../core/decorators/user.decorator";
import { User } from "../../users/interfaces/user.interface";
import { UniqueNumberService } from "../../uniquenumber/uniquenumber.service";
import { NUMBER_TYPE } from "../../uniquenumber/uniquenumber.interface";
import { UserService } from "../../users/services/user.service";
import { getConnection } from "typeorm";
import { SupplierOfferService } from "../../price-requests/services/supplier-offer.service";
import { PurchaseOrderAdditionnalCost } from "../interfaces/purchase-order-additionnal-cost.interface";
import { PurchaseOrderAdditionnalCostService } from "../services/purchase-order-additionnal-cost.service";
import { PurchaseOrderElement, PurchaseOrderElementInput } from "../interfaces/purchase-order-element.interface";
import { PurchaseOrderElementService } from "../services/purchase-order-element.service";
import { PurchaseOrderElementOptionService } from "../services/purchase-order-element-option.service";
import { PurchaseOrderPdfManager } from "../managers/purchase-order-pdf.manager";
import { ErrorUtil } from "../../../core/utils/error.util";
import { SupplierOfferElementService } from "../../price-requests/services/supplier-offer-element.service";
import { ERROR_MESSAGE } from "../../../core/errors/enum/error.enum";
import { PriceRequestAdditionnalCostService } from "../../price-requests/services/price-request-additionnal-cost.service";
import { Pagination } from "../../../core/interfaces/crud.interface";
import { SmtpConfigSql } from "../../smtp-config/entities/smtp-config.entity";
import { SmtpConfigService } from "../../smtp-config/services/smtp-config.service";
import { PERMISSION_CATEGORIES } from "../../users/enums/permissioncategories.enum";
import { PERMISSION_TYPES } from "../../users/enums/permissiontypes.enum";
import { AuthService } from "../../auth/auth.service";
import { SupplyCategoryService } from "../../../app/suppliers/services/supply-category.service";

import { AddScanPdfInput, InputScanPdf } from "../../scan-pdf/interfaces/scan-pdf.interface";
import { ScanPdfService } from "../../scan-pdf/services/scan-pdf.service";
import { PriceRequestElementService } from "../../price-requests/services/price-request-element.service";
import { PriceRequestElement } from "../../price-requests/interfaces/price-request-element.interface";
const PATH = require('path');
@Resolver("PurchaseOrder")
@UseInterceptors(GqlLoggerInterceptor)
export class PurchaseOrderResolver {

    public constructor(
        private readonly _purchaseOrderSrv: PurchaseOrderService,
        private readonly _smtpConfigSrv: SmtpConfigService,
        private readonly _projectSrv: ProjectService,
        private readonly _supplierSrv: SupplierService,
        private readonly _supplierContactSrv: SupplierContactService,
        private readonly _priceRequestSrv: PriceRequestService,
        private readonly _uniqueSrv: UniqueNumberService,
        private readonly _userSrv: UserService,
        private readonly _supplierOfferSrv: SupplierOfferService,
        private readonly _supplierOfferElementSrv: SupplierOfferElementService,
        private readonly _priceRequestAdditionnalCostSrv: PriceRequestAdditionnalCostService,
        private readonly _purchaseOrderAdditionnalCostSrv: PurchaseOrderAdditionnalCostService,
        private readonly _purchaseOrderElementSrv: PurchaseOrderElementService,
        private readonly _purchaseOrderElementOptionSrv: PurchaseOrderElementOptionService,
        private readonly _purchaseOrderPdfMgr: PurchaseOrderPdfManager,
        private readonly _authSrv: AuthService,
        private readonly _purchaseOrderElmentSrv: PurchaseOrderElementService,
        private readonly _supplyCategoriesSrv: SupplyCategoryService,
        private readonly _scanPdfSrv: ScanPdfService,
        private readonly _priceRequestElementSrv: PriceRequestElementService,
    ) { }

    @Query("purchaseOrder")
    @Access(GRANT_TOKEN.FRONT_ACCESS)
    public async getById(@Args("id") id: number, @UUID() uuid: string): Promise<PurchaseOrder> {
        const purchaseOrder = await this._purchaseOrderSrv.getById(id, uuid);
        const scanpdf = await this._scanPdfSrv.findByProperty({ purchaseOrderId: id, deletedAt: null });
        if (scanpdf.length > 0) {
            purchaseOrder.scanPdfs = scanpdf;
        }
        return purchaseOrder;
    }


    @Query("purchaseOrders")
    @Access(GRANT_TOKEN.FRONT_ACCESS)
    public async getList(
        @Args("search") search: string,
        @Args("sort") sort: PurchaseOrderSort,
        @Args("pagination") pagination: Pagination,
        @Context() ctx: any,
    ): Promise<PurchaseOrder[]> {
        const results = await this._purchaseOrderSrv.frontList({ search }, sort, pagination);
        ctx.pagination = results.pagination;

        let readpermisssion = this._authSrv.authorized(ctx.req.user.userGroup, PERMISSION_CATEGORIES.PURCHASE_ORDERS, PERMISSION_TYPES.READ);
        if (readpermisssion) {
            //get scanPdf and insert value in PurchaseOrder 
            for (let index = 0; index < results.data.length; index++) {
                const element = results.data[index];
                const scanpdf = await this._scanPdfSrv.findByProperty({ purchaseOrderId: element.id, deletedAt: null });
                if (scanpdf.length > 0) {
                    element.scanPdfs = scanpdf;
                }
            }
            return results.data;
        } else {
            throw new BadRequestException(ERROR_MESSAGE.FORBIDDEN);
        }
    }

    @Query("getPurchaseOrderReference")
    @Access(GRANT_TOKEN.FRONT_ACCESS)
    public async getNumber(@Usr() user: User): Promise<string> {
        const search: string = this._uniqueSrv.getLastNumberSearchPattern(NUMBER_TYPE.PURCHASE_ORDER);
        const lastNumber: string = await this._purchaseOrderSrv.getLastPurchaseOrderReference(search);

        return this._uniqueSrv.getNumber(NUMBER_TYPE.PURCHASE_ORDER, user, lastNumber);
    }

    @Query("purchaseOrdersByProject")
    @Access(GRANT_TOKEN.FRONT_ACCESS)
    public async purchaseOrdersByProject(
        @Args("projectId") projectId: number,
        @Args("pagination") pagination: Pagination,
        @Context() ctx: any
    ): Promise<PurchaseOrder[]> {
        const results = await this._purchaseOrderSrv.getByProject(projectId, pagination);
        ctx.pagination = results.pagination;
        return results.data;
    }

    @Mutation("createPurchaseOrderFromProject")
    @Access(GRANT_TOKEN.FRONT_ACCESS)
    public async createFromProject(
        @Args("data") data: PurchaseOrderInput,
        @Usr() user: User,
        @Args("scanData") scanData?: AddScanPdfInput[]
    ): Promise<PurchaseOrder> {
        const categories = await this._supplyCategoriesSrv.findByProperty({ name: "Divers" });

        data.userId = user.id;
        data.status = PurchaseOrderStatus.CREATED;

        // Make sure the given reference is the good one
        data.reference = await this.getNumber(user);

        // Get favorite SupplierContact for given Supplier if it exists
        const supplierContact = (await this._supplierContactSrv.getBy({ supplierId: data.supplierId, isFavorite: true })).shift();
        data.supplierContactId = supplierContact ? supplierContact.id : null;

        const created = await this._purchaseOrderSrv.create(data);

        for (let index = 0; scanData && index < scanData.length; index++) {
            const element = scanData[index];
            const scanPdf: InputScanPdf = {
                name: element.originalname,
                url: element.path,
                purchaseOrderId: created.id
            };
            await this._scanPdfSrv.addScanPdf(scanPdf);
        }

        await this.freeNumber(user);

        return created;
    }

    @Mutation("createPurchaseOrderFromSupplierOffer")
    @Access(GRANT_TOKEN.FRONT_ACCESS)
    public async createFromSupplierOfffer(@Args("data") data: PurchaseOrderFromSupplierOfferInput[], @Usr() user: User, @UUID() uuid: string): Promise<PurchaseOrder[]> {
        const search: string = this._uniqueSrv.getLastNumberSearchPattern(NUMBER_TYPE.PURCHASE_ORDER);
        const lastNumberFromDb: string = await this._purchaseOrderSrv.getLastPurchaseOrderReference(search);
        const usedPriceRequests: PriceRequest[] = [];
        const resTransaction = await getConnection().transaction(async transaction => {
            const createdOrders: PurchaseOrder[] = [];
            for (const input of data) {
                if (input.elements.some(selected => !selected.priceRequestElementId && !selected.supplierOfferElementId)) {
                    throw new BadRequestException(ERROR_MESSAGE.INVALID_ELEMENTS_FOR_PURCHASE_ORDER);
                }

                // Create all missing SupplierOfferElements
                const newIds: number[] = input.elements.filter(element => !!element.priceRequestElementId).map(element => element.priceRequestElementId);
                const missingElements = await this._supplierOfferElementSrv.associateMany(input.supplierOfferId, newIds, [], transaction);
                input.elements.forEach(selected => {
                    if (!!selected.priceRequestElementId) {
                        const foundSOElement = missingElements.find(soe => soe.priceRequestElementId == selected.priceRequestElementId);
                        selected.supplierOfferElementId = foundSOElement ? foundSOElement.id : null;
                    }
                });

                // Prepare base PurchaseOrder
                input.userId = user.id;
                input.status = PurchaseOrderStatus.CREATED;
                const supplierOffer = await this._supplierOfferSrv.getAllDataForPurchaseOrder(input.supplierOfferId, transaction);

                // Get unique number and save PurchaseOrder
                const lastNumber: string = createdOrders.length === 0 ? lastNumberFromDb : createdOrders[createdOrders.length - 1].reference;
                input.reference = await this._uniqueSrv.getNumber(NUMBER_TYPE.PURCHASE_ORDER, user, lastNumber);
                const purchaseOrder = await this._purchaseOrderSrv.createFromSupplierOffer(input, supplierOffer, transaction);
                await this.freeNumber(user);

                // Update PriceRequest status if necessary
                if (usedPriceRequests.indexOf(supplierOffer.priceRequest) === -1) usedPriceRequests.push(supplierOffer.priceRequest)

                // Serialize additionnalCosts
                if (!!input.additionnalCosts && input.additionnalCosts.length > 0) {
                    const additionnalCosts = await this._priceRequestAdditionnalCostSrv.getMergedForPurchaseOrder(input.additionnalCosts);
                    purchaseOrder.additionnalCosts = await this._purchaseOrderAdditionnalCostSrv.createFromSupplierOffer(additionnalCosts, purchaseOrder.id, input.additionnalCosts, transaction);
                }

                // Serialize elements
                purchaseOrder.elements = await this._purchaseOrderElementSrv.createFromSupplierOffer(supplierOffer.elements, purchaseOrder.id, input.elements, transaction);

                // Serialize element's options
                const options = await this._purchaseOrderElementOptionSrv.createFromSupplierOffer(supplierOffer.elements, purchaseOrder.elements, transaction);
                options.forEach(option => {
                    const foundElement = purchaseOrder.elements.find(element => element.id == option.purchaseOrderElementId);
                    foundElement.options ?
                        foundElement.options.push(option) :
                        foundElement.options = [option];
                });

                createdOrders.push(purchaseOrder);
            }
            return createdOrders;
        }).catch((err => {
            this.freeNumber(user);
            throw ErrorUtil.get(err);
        }));

        usedPriceRequests.forEach(async (priceRequest: PriceRequest) => {
            let totalQuantity = 0;
            let totalPurchaseOrderQuantity = 0;

            const priceRequestElements = await this._priceRequestElementSrv.getByPriceRequest(priceRequest.id, uuid);
            for (let k in priceRequestElements) {
                const priceRequestElement: PriceRequestElement = priceRequestElements[k];
                let purchaseOrderQuantity = await this._priceRequestElementSrv.getPurchaseOrderQuantity(priceRequestElement.id, uuid);
                totalPurchaseOrderQuantity += parseInt('' + purchaseOrderQuantity);
                totalQuantity += parseInt('' + priceRequestElement.quantity);
            }

            let status = totalQuantity === totalPurchaseOrderQuantity ? PriceRequestStatus.ORDERED : PriceRequestStatus.PARTIALLY;
            await this._priceRequestSrv.update(priceRequest.id, { status: status }, uuid);
        });

        return resTransaction;
    }

    @Mutation("freePurchaseOrderReference")
    @Access(GRANT_TOKEN.FRONT_ACCESS)
    public async freeNumber(@Usr() user: User): Promise<boolean> {
        return this._uniqueSrv.freeNumber(NUMBER_TYPE.PURCHASE_ORDER, user);
    }

    @Mutation("deletePurchaseOrder")
    @Access(GRANT_TOKEN.FRONT_ACCESS)
    public async delete(@Args("id") id: number, @Context() ctx: any): Promise<boolean> {

        //check permission delete purchase orders
        let deletepermisssion = this._authSrv.authorized(ctx.req.user.userGroup, PERMISSION_CATEGORIES.PURCHASE_ORDERS, PERMISSION_TYPES.DELETE);
        if (deletepermisssion) {
            return await getConnection().transaction(async transaction => {
                const purchaseOrder = await this._purchaseOrderSrv.getById(id, transaction);
                if (this._purchaseOrderSrv.isEditable(purchaseOrder)) {
                    // Unlink PriceRequestElements so the PriceRequest becomes editable again
                    await this._purchaseOrderElementSrv.updateBy({ purchaseOrderId: id }, { supplierOfferElementId: null }, transaction);

                    return this._purchaseOrderSrv.delete(id, transaction);
                }

                return false;
            }).catch(err => { throw ErrorUtil.get(err); });
        } else {
            throw new BadRequestException(ERROR_MESSAGE.FORBIDDEN);
        }
    }

    @Mutation("updatePurchaseOrder")
    @Access(GRANT_TOKEN.FRONT_ACCESS)
    public async update(@Args("id") id: number, @Args("data") data: PurchaseOrderUpdate, @UUID() uuid: string, @Context() ctx: any): Promise<PurchaseOrder> {
        // If only remark or internalRemark, update it without checking if editable or not
        //check update permission purchase order
        let updatepermisssion = this._authSrv.authorized(ctx.req.user.userGroup, PERMISSION_CATEGORIES.PURCHASE_ORDERS, PERMISSION_TYPES.WRITE);
        if (updatepermisssion) {
            const keysToUpdate = Object.keys(data);
            if (keysToUpdate.length == 2 && keysToUpdate.includes('remark') && keysToUpdate.includes('internalRemark')) {
                return await this._purchaseOrderSrv.update(id, data, uuid);
            }
            const purchaseOrder = await this._purchaseOrderSrv.getById(id, uuid);
            if (this._purchaseOrderSrv.isEditable(purchaseOrder)) {
                if (data.supplierId) {
                    const contact = data.supplierContactId ? await this._supplierContactSrv.getById(data.supplierContactId, uuid) : null;
                    if (!contact || contact.supplierId != data.supplierId) {
                        const favoriteContacts = await this._supplierContactSrv.getBy({ isFavorite: true, supplierId: data.supplierId });
                        data.supplierContactId = favoriteContacts.length > 0 ? favoriteContacts.shift().id : null;
                    }
                }
                return this._purchaseOrderSrv.update(id, data, uuid + 1);
            }
        } else {
            throw new BadRequestException(ERROR_MESSAGE.FORBIDDEN);
        }

        return null;
    }

    @Mutation("sendPurchaseOrderMail")
    @Access(GRANT_TOKEN.FRONT_ACCESS)
    public async sendPurchaseOrderMail(@Args("id") id: number, @UUID() uuid: string, @Usr() user: User): Promise<boolean> {
        const purchaseOrder = await this._purchaseOrderSrv.getById(id, uuid);
        if (this._purchaseOrderSrv.isEditable(purchaseOrder)) {
            const pdfResult = await this._purchaseOrderPdfMgr.generatePdf(id);
            const scansPdf = await this._scanPdfSrv.findByProperty({ purchaseOrderId: id, deletedAt: null });
            const scansPdfPath = scansPdf.map((scan) => ({ fileName: scan.name, path: process.cwd() + PATH.sep + 'filesPdf' + PATH.sep + scan.url }));
            let smtpConfig: SmtpConfigSql = await this._smtpConfigSrv.findByLoginId(user.id);
            if (!smtpConfig || !smtpConfig.active) smtpConfig = undefined;

            return this._purchaseOrderSrv.sendPurchaseOrderToSupplier(scansPdfPath.concat([pdfResult.pdf]), pdfResult.data.purchaseOrder, pdfResult.data.lang, uuid, smtpConfig);
        }

        return false;
    }

    @ResolveProperty("project")
    public async getProject(@Parent() purchaseOrder: PurchaseOrder, @UUID() uuid: string): Promise<Project> {
        return purchaseOrder.projectId ? this._projectSrv.getById(purchaseOrder.projectId, uuid) : null;
    }

    @ResolveProperty("supplier")
    public async getSupplier(@Parent() purchaseOrder: PurchaseOrder, @UUID() uuid: string): Promise<Supplier> {
        return purchaseOrder.supplierId ? this._supplierSrv.getById(purchaseOrder.supplierId, uuid) : null;
    }

    @ResolveProperty("supplierContact")
    public async getSupplierContact(@Parent() purchaseOrder: PurchaseOrder, @UUID() uuid: string): Promise<SupplierContact> {
        return purchaseOrder.supplierContactId ? this._supplierContactSrv.getById(purchaseOrder.supplierContactId, uuid) : null;
    }

    @ResolveProperty("priceRequest")
    public async getPriceRequest(@Parent() purchaseOrder: PurchaseOrder, @UUID() uuid: string): Promise<PriceRequest> {
        return purchaseOrder.priceRequestId ? this._priceRequestSrv.getById(purchaseOrder.priceRequestId, uuid) : null;
    }

    @ResolveProperty("user")
    public async getUser(@Parent() purchaseOrder: PurchaseOrder, @UUID() uuid: string): Promise<PriceRequest> {
        return purchaseOrder.userId ? this._userSrv.getById(purchaseOrder.userId, uuid) : null;
    }

    @ResolveProperty("additionnalCosts")
    public async getAdditionnalCosts(@Parent() purchaseOrder: PurchaseOrder, @UUID() uuid: string): Promise<PurchaseOrderAdditionnalCost[]> {
        return !purchaseOrder.additionnalCosts ? await this._purchaseOrderAdditionnalCostSrv.getByPurchaseOrder(purchaseOrder.id, uuid) : purchaseOrder.additionnalCosts;
    }

    @ResolveProperty("elements")
    public async getElements(@Parent() purchaseOrder: PurchaseOrder, @UUID() uuid: string): Promise<PurchaseOrderElement[]> {
        return !purchaseOrder.elements ? await this._purchaseOrderElementSrv.getByPurchaseOrder(purchaseOrder.id, uuid) : purchaseOrder.elements;
    }

    @ResolveProperty("linkedProjects")
    public async getLinkedProjects(@Parent() purchaseOrder: PurchaseOrder, @UUID() uuid: string): Promise<Project[]> {
        return this._projectSrv.getByPurchaseOrder(purchaseOrder.id, uuid);
    }

    @ResolveProperty("isSent")
    public async getIsSent(@Parent() purchaseOrder: PurchaseOrder): Promise<boolean> {
        return purchaseOrder.sendingDate != null;
    }

    @ResolveProperty("totalPrice")
    public async getTotalPrice(@Parent() purchaseOrder: PurchaseOrder, @UUID() uuid: string): Promise<number> {
        return this._purchaseOrderSrv.getTotalPrice(purchaseOrder.id, uuid);
    }

    @ResolveProperty("totalAdditionnalCosts")
    public async getTotalAdditionnalCosts(@Parent() purchaseOrder: PurchaseOrder, @UUID() uuid: string): Promise<number> {
        return this._purchaseOrderSrv.getTotalAdditionnalCosts(purchaseOrder.id, uuid);
    }
}