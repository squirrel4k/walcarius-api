import { Resolver, ResolveProperty, Parent, Query, Args, Mutation, Context } from "@nestjs/graphql";
import { PurchaseOrderElementService } from "../services/purchase-order-element.service";
import { PurchaseOrderService } from "../services/purchase-order.service";
import { SupplierOfferElementService } from "../../price-requests/services/supplier-offer-element.service";
import { SupplyCategoryService } from "../../suppliers/services/supply-category.service";
import { UUID } from "../../../core/decorators/uuid.decorator";
import { PurchaseOrder } from "../interfaces/purchase-order.interface";
import { PurchaseOrderElement, PurchaseOrderElementFilter, PurchaseOrderElementInput, PurchaseOrderElementUpdate, PurchaseOrderElementRemarkUpdate, FilterPurchaseOrderElement, PurchaseOrderElementFilterTest, EnumPurchaseOrderElementStatus, ElementUnit, PurchaseOrderElementFormatUpdate, PurchaseOrderElementDenominationUpdate, PurchaseOrderElementQuantityUpdate, PurchaseOrderElementMatiereUpdate, PurchaseOrderElementWeightUpdate, PurchaseOrderElementWidthUpdate, PurchaseOrderElementLengthUpdate, PurchaseOrderElementThicknessUpdate, PurchaseOrderElementQuantityUnitUpdate, PurchaseOrderElementEn1090Update, PurchaseOrderElementOptionUpdate, PurchaseOrderElementPriceUpdate, PurchaseOrderElementDeliveryDateUpdate } from "../interfaces/purchase-order-element.interface";
import { SupplierOfferElement } from "../../price-requests/interfaces/supplier-offer-element.interface";
import { SupplyCategory } from "../../suppliers/interfaces/supply-category.interface";
import { PurchaseOrderElementOption } from "../interfaces/purchase-order-element-option.interface";
import { PurchaseOrderElementOptionService } from "../services/purchase-order-element-option.service";
import { Access } from "../../../core/decorators/access.decorator";
import { GRANT_TOKEN } from "../../common/jwt/jwt.interface";
import { BadRequestException, UseInterceptors } from "@nestjs/common";
import { ERROR_MESSAGE } from "../../../core/errors/enum/error.enum";
import { getConnection, In } from "typeorm";
import { ErrorUtil } from "../../../core/utils/error.util";
import { GqlLoggerInterceptor } from "../../common/interceptors/gql-logger.interceptor";
import { Pagination } from "../../../core/interfaces/crud.interface";
import { PurchaseOrderAdmissionLogService } from "../../purchaseOrderAdmissionLog/services/purchaseOrderAdmissionLog.service";
import { PriceRequestElementService } from "../../price-requests/services/price-request-element.service";
import { PurchaseOrderElementSql } from "../entities/purchase-order-element.entity";

@Resolver("PurchaseOrderElement")
@UseInterceptors(GqlLoggerInterceptor)
export class PurchaseOrderElementResolver {
    private quantityAdmission: number;
    public constructor(
        private readonly _purchaseOrderElementSrv: PurchaseOrderElementService,
        private readonly _purchaseOrderSrv: PurchaseOrderService,
        private readonly _supplierOfferElementSrv: SupplierOfferElementService,
        private readonly _supplyCategorySrv: SupplyCategoryService,
        private readonly _purchaseOrderElementOptionSrv: PurchaseOrderElementOptionService,
        private readonly _purchaseOrderAdmissionLogSrv: PurchaseOrderAdmissionLogService,
        private readonly _priceRequestElementSrv: PriceRequestElementService,
    ) { }

    @Query("purchaseOrderElement")
    @Access(GRANT_TOKEN.FRONT_ACCESS)
    public async getById(@Args("id") id: number, @UUID() uuid: string): Promise<PurchaseOrderElement> {
        return this._purchaseOrderElementSrv.getById(id, uuid);
    }

    @Query("purchaseOrderElements")
    @Access(GRANT_TOKEN.FRONT_ACCESS)
    public async getList(@Args("filter") filter: PurchaseOrderElementFilter): Promise<PurchaseOrderElement[]> {
        return this._purchaseOrderElementSrv.getList(filter);
    }

    @Query("filterPurchaseOrderElement")
    @Access(GRANT_TOKEN.FRONT_ACCESS)
    public async filterPurchaseOrderElement(
        @Args("search") search: string,
        @Args("filter") filter: FilterPurchaseOrderElement,
        @Args("pagination") pagination?: Pagination,
        @Context() ctx?: any): Promise<PurchaseOrderElement[]> {
        const results = await this._purchaseOrderElementSrv.listFilterPurchaseOrderElement(search, filter, pagination);
        const stockData = await this.getStockData(search, filter, pagination, results)
        ctx.pagination = results.pagination;
        // get admission to use qtt/qttTotal in front
        for (let index = 0; index < results.data.length; index++) {
            const element = results.data[index];
            let admission = await this._purchaseOrderAdmissionLogSrv.findByProperty({ idElement: element.id });
            this.quantityAdmission = 0;
            for (let index = 0; index < admission.length; index++) {
                const elementAdmission = admission[index];
                this.quantityAdmission += elementAdmission.quantity;
            }
            //add qttOnqttTotal key in results.data element
            let newQuantity = "qttOnqttTotal";

            //round element.quantity 
            let qtt = this.roundQuantity(+element.quantity);
            let valQuantity = this.quantityAdmission + "/" + qtt;
            element[newQuantity] = valQuantity;

            let valqttRecept = +this.quantityAdmission;

            if (valqttRecept > 0 && valqttRecept < element.quantity) {
                let data = { status: EnumPurchaseOrderElementStatus.ENCOURS }
                let update = await this._purchaseOrderElementSrv.updatePurchaseOrderElement(data, element.id)
            }

            if (valqttRecept == element.quantity) {
                let data = { status: EnumPurchaseOrderElementStatus.RECEPTIONNE }
                let update = await this._purchaseOrderElementSrv.updatePurchaseOrderElement(data, element.id)
            }

        }
        const finalResult = [...results.data, ...stockData]
        finalResult.sort(function sortByDateAsc(a: any, b: any) {
            return b.createdAt.getTime() - a.createdAt.getTime();
        })
        return finalResult;
    }

    private async getStockData(search, filter, pagination, results): Promise<PurchaseOrderElementSql[]> {
        if (results.data.length >= 50) {
            const allDate = results.data.map(i => i.createdAt);
            const minDate = new Date(Math.min.apply(null, allDate))
            const maxDate = new Date(Math.max.apply(null, allDate))
            filter.dateFrom = filter.dateFrom || minDate;
            filter.dateTo = filter.dateTo || maxDate;
        } else {
            pagination.limit = pagination.limit - results.data.length
        }
        if ((filter.status && filter.status != EnumPurchaseOrderElementStatus.RECEPTIONNE) || filter.bdc) {
            return new Promise((res) => res([]))
        }
        const second = await this._priceRequestElementSrv.listFilterStockElement(search, filter, { ...pagination })
        return await Promise.all(second.data?.map(async (f) => {
            const supplyListElement = f.amalgamGroup.amalgams?.[0].parts?.[0]?.supplyListElement;
            const priceDetails = await this._purchaseOrderElementSrv.calculateElementPriceByMatterAndDenomination(f.amalgamGroup?.matterRef, supplyListElement?.reference);
            return ({
                id: f.id,
                quantity: 0,
                denomination: supplyListElement?.reference || supplyListElement?.denomination,
                isEn1090: f.amalgamGroup?.isEn1090 || false,
                isBlack: f.amalgamGroup?.isBlack,
                status: EnumPurchaseOrderElementStatus.RECEPTIONNE,
                isBlasted: f.amalgamGroup?.isBlasted,
                isPrimaryBlasted: f.amalgamGroup?.isPrimaryBlasted,
                format: f.amalgamGroup?.format,
                weight: f.weight,
                matterRef: f.amalgamGroup?.matterRef,
                quantityUnit: supplyListElement?.quantityUnit,
                thickness: supplyListElement?.thickness,
                length: supplyListElement?.length,
                width: supplyListElement?.width,
                remark: f.remark,
                deliveryDate: supplyListElement?.supplyList?.deliveryDate,
                realDeliveryDate: null,
                price: priceDetails.price,
                unit: ElementUnit.EURO_BY_METER,
                isPrinted: false,
                printedQuantity: 0,
                purchaseOrderId: 0,
                projectId: supplyListElement?.supplyList?.projectId,
                purchaseOrder: null,
                supplierOfferElementId: null,
                supplierOfferElement: null,
                supplierName: priceDetails.supplierName,
                supplyCategoryId: null,
                supplyCategory: null,
                createdAt: f.createdAt,
                isInStock: true,
                qttOnqttTotal: `${f.amalgamGroup?.amalgams?.filter(a => a.isInStock).length}/${f.amalgamGroup?.amalgams?.filter(a => a.isInStock).length}`,
                qttRecept: f.amalgamGroup?.amalgams?.filter(a => a.isInStock).length,
                projectRef: supplyListElement?.supplyList?.project?.reference,
                deletedAt: null,
                options: []
            })
        }))
    }

    //function to round quantity
    public roundQuantity(chiffre) {
        if (Number.isInteger(chiffre)) {
            return chiffre;
        } else {
            //return parseFloat(chiffre).toFixed(2);
            return Math.round((chiffre + Number.EPSILON) * 100) / 100;
        }
    }
    @Mutation("createPurchaseOrderElement")
    @Access(GRANT_TOKEN.FRONT_ACCESS)
    public async create(@Args("data") data: PurchaseOrderElementInput, @UUID() uuid: string): Promise<PurchaseOrderElement> {
        const purchaseOrder = await this._purchaseOrderSrv.getById(data.purchaseOrderId, uuid);
        if (!(this._purchaseOrderSrv.isEditable(purchaseOrder))) {
            throw new BadRequestException(ERROR_MESSAGE.PURCHASE_ORDER_ALREADY_SENT);
        }

        return await getConnection().transaction(async manager => {
            // Create top element
            const element = await this._purchaseOrderElementSrv.create(data, manager);

            // Create its options
            const options = data.options.map(option => ({ ...option, purchaseOrderElementId: element.id }));
            element.options = await this._purchaseOrderElementOptionSrv.createMany(options, manager);

            return element;
        }).catch(err => { throw ErrorUtil.get(err); });
    }

    @Mutation("updatePurchaseOrderElement")
    @Access(GRANT_TOKEN.FRONT_ACCESS)
    public async update(@Args("id") id: number, @Args("data") data: PurchaseOrderElementUpdate): Promise<PurchaseOrderElement> {
        const purchaseOrder = await this._purchaseOrderSrv.getByPurchaseOrderElement(id);
        if (!(this._purchaseOrderSrv.isEditable(purchaseOrder))) {
            throw new BadRequestException(ERROR_MESSAGE.PURCHASE_ORDER_ALREADY_SENT);
        }

        return await getConnection().transaction(async manager => {
            // Upsert element's options
            const options = data.options.map(option => ({ ...option, purchaseOrderElementId: id }));
            await this._purchaseOrderElementOptionSrv.upsertMany(options, manager);
            delete data.options;

            // Delete asked options
            if (data.deletedOptionIds.length > 0) {
                await this._purchaseOrderElementOptionSrv.deleteBy({ id: In(data.deletedOptionIds) }, manager);
            }
            delete data.deletedOptionIds;

            return await this._purchaseOrderElementSrv.update(id, data, manager);
        }).catch(err => { throw ErrorUtil.get(err); });
    }

    @Mutation("updatePurchaseOrderElementRemark")
    @Access(GRANT_TOKEN.FRONT_ACCESS)
    public async updateRemark(@Args("id") id: number, @Args("data") data: PurchaseOrderElementRemarkUpdate, @UUID() uuid: string): Promise<PurchaseOrderElement> {
        const purchaseOrder = await this._purchaseOrderSrv.getByPurchaseOrderElement(id);
        if (!purchaseOrder) {
            throw new BadRequestException(ERROR_MESSAGE.NO_PURCHASE_ORDER);
        }

        return await this._purchaseOrderElementSrv.update(id, data, uuid);
    }

    @Mutation("updatePurchaseOrderElementFormat")
    @Access(GRANT_TOKEN.FRONT_ACCESS)
    public async updatFormat(@Args("id") id: number, @Args("data") data: PurchaseOrderElementFormatUpdate, @UUID() uuid: string): Promise<PurchaseOrderElement> {
        const purchaseOrder = await this._purchaseOrderSrv.getByPurchaseOrderElement(id);
        if (!purchaseOrder) {
            throw new BadRequestException(ERROR_MESSAGE.NO_PURCHASE_ORDER);
        }

        return await this._purchaseOrderElementSrv.update(id, data, uuid);
    }

    @Mutation("updatePurchaseOrderElementDenomination")
    @Access(GRANT_TOKEN.FRONT_ACCESS)
    public async updatDenomination(@Args("id") id: number, @Args("data") data: PurchaseOrderElementDenominationUpdate, @UUID() uuid: string): Promise<PurchaseOrderElement> {
        const purchaseOrder = await this._purchaseOrderSrv.getByPurchaseOrderElement(id);
        if (!purchaseOrder) {
            throw new BadRequestException(ERROR_MESSAGE.NO_PURCHASE_ORDER);
        }

        return await this._purchaseOrderElementSrv.update(id, data, uuid);
    }

    @Mutation("updatePurchaseOrderElementMatiere")
    @Access(GRANT_TOKEN.FRONT_ACCESS)
    public async updatMatiere(@Args("id") id: number, @Args("data") data: PurchaseOrderElementMatiereUpdate, @UUID() uuid: string): Promise<PurchaseOrderElement> {
        const purchaseOrder = await this._purchaseOrderSrv.getByPurchaseOrderElement(id);
        if (!purchaseOrder) {
            throw new BadRequestException(ERROR_MESSAGE.NO_PURCHASE_ORDER);
        }

        return await this._purchaseOrderElementSrv.update(id, data, uuid);
    }

    @Mutation("updatePurchaseOrderElementWeight")
    @Access(GRANT_TOKEN.FRONT_ACCESS)
    public async updatWeight(@Args("id") id: number, @Args("data") data: PurchaseOrderElementWeightUpdate, @UUID() uuid: string): Promise<PurchaseOrderElement> {
        const purchaseOrder = await this._purchaseOrderSrv.getByPurchaseOrderElement(id);
        if (!purchaseOrder) {
            throw new BadRequestException(ERROR_MESSAGE.NO_PURCHASE_ORDER);
        }

        return await this._purchaseOrderElementSrv.update(id, data, uuid);
    }

    @Mutation("updatePurchaseOrderElementWidth")
    @Access(GRANT_TOKEN.FRONT_ACCESS)
    public async updatWidth(@Args("id") id: number, @Args("data") data: PurchaseOrderElementWidthUpdate, @UUID() uuid: string): Promise<PurchaseOrderElement> {
        const purchaseOrder = await this._purchaseOrderSrv.getByPurchaseOrderElement(id);
        if (!purchaseOrder) {
            throw new BadRequestException(ERROR_MESSAGE.NO_PURCHASE_ORDER);
        }

        return await this._purchaseOrderElementSrv.update(id, data, uuid);
    }

    @Mutation("updatePurchaseOrderElementLength")
    @Access(GRANT_TOKEN.FRONT_ACCESS)
    public async updatLength(@Args("id") id: number, @Args("data") data: PurchaseOrderElementLengthUpdate, @UUID() uuid: string): Promise<PurchaseOrderElement> {
        const purchaseOrder = await this._purchaseOrderSrv.getByPurchaseOrderElement(id);
        if (!purchaseOrder) {
            throw new BadRequestException(ERROR_MESSAGE.NO_PURCHASE_ORDER);
        }

        return await this._purchaseOrderElementSrv.update(id, data, uuid);
    }

    @Mutation("updatePurchaseOrderElementThickness")
    @Access(GRANT_TOKEN.FRONT_ACCESS)
    public async updatThickness(@Args("id") id: number, @Args("data") data: PurchaseOrderElementThicknessUpdate, @UUID() uuid: string): Promise<PurchaseOrderElement> {
        const purchaseOrder = await this._purchaseOrderSrv.getByPurchaseOrderElement(id);
        if (!purchaseOrder) {
            throw new BadRequestException(ERROR_MESSAGE.NO_PURCHASE_ORDER);
        }

        return await this._purchaseOrderElementSrv.update(id, data, uuid);
    }

    @Mutation("updatePurchaseOrderElementPrice")
    @Access(GRANT_TOKEN.FRONT_ACCESS)
    public async updatePrice(@Args("id") id: number, @Args("data") data: PurchaseOrderElementPriceUpdate, @UUID() uuid: string): Promise<PurchaseOrderElement> {
        const purchaseOrder = await this._purchaseOrderSrv.getByPurchaseOrderElement(id);
        if (!purchaseOrder) {
            throw new BadRequestException(ERROR_MESSAGE.NO_PURCHASE_ORDER);
        }

        return await this._purchaseOrderElementSrv.update(id, data, uuid);
    }

    @Mutation("updatePurchaseOrderElementDeliveryDate")
    @Access(GRANT_TOKEN.FRONT_ACCESS)
    public async updateDeliveryDate(@Args("id") id: number, @Args("data") data: PurchaseOrderElementDeliveryDateUpdate, @UUID() uuid: string): Promise<PurchaseOrderElement> {
        const purchaseOrder = await this._purchaseOrderSrv.getByPurchaseOrderElement(id);
        if (!purchaseOrder) {
            throw new BadRequestException(ERROR_MESSAGE.NO_PURCHASE_ORDER);
        }

        return await this._purchaseOrderElementSrv.update(id, data, uuid);
    }

    @Mutation("updatePurchaseOrderElementEn1090")
    @Access(GRANT_TOKEN.FRONT_ACCESS)
    public async updatEn1090(@Args("id") id: number, @Args("data") data: PurchaseOrderElementEn1090Update, @UUID() uuid: string): Promise<PurchaseOrderElement> {
        const purchaseOrder = await this._purchaseOrderSrv.getByPurchaseOrderElement(id);
        if (!purchaseOrder) {
            throw new BadRequestException(ERROR_MESSAGE.NO_PURCHASE_ORDER);
        }

        return await this._purchaseOrderElementSrv.update(id, data, uuid);
    }

    @Mutation("updatePurchaseOrderElementOption")
    @Access(GRANT_TOKEN.FRONT_ACCESS)
    public async updatOption(@Args("id") id: number, @Args("data") data: PurchaseOrderElementOptionUpdate, @UUID() uuid: string): Promise<PurchaseOrderElement> {
        console.info({ data });
        const purchaseOrder = await this._purchaseOrderSrv.getByPurchaseOrderElement(id);
        if (!purchaseOrder) {
            throw new BadRequestException(ERROR_MESSAGE.NO_PURCHASE_ORDER);
        }

        return await this._purchaseOrderElementSrv.update(id, data, uuid);
    }

    @Mutation("updatePurchaseOrderElementQuantity")
    @Access(GRANT_TOKEN.FRONT_ACCESS)
    public async updatQuantity(@Args("id") id: number, @Args("data") data: PurchaseOrderElementQuantityUnitUpdate, @UUID() uuid: string): Promise<PurchaseOrderElement> {
        const purchaseOrder = await this._purchaseOrderSrv.getByPurchaseOrderElement(id);
        if (!purchaseOrder) {
            throw new BadRequestException(ERROR_MESSAGE.NO_PURCHASE_ORDER);
        }

        return await this._purchaseOrderElementSrv.update(id, data, uuid);
    }

    @Mutation("updatePurchaseOrderElementQuantityUnit")
    @Access(GRANT_TOKEN.FRONT_ACCESS)
    public async updatQuantityUnit(@Args("id") id: number, @Args("data") data: PurchaseOrderElementQuantityUpdate, @UUID() uuid: string): Promise<PurchaseOrderElement> {
        const purchaseOrder = await this._purchaseOrderSrv.getByPurchaseOrderElement(id);
        if (!purchaseOrder) {
            throw new BadRequestException(ERROR_MESSAGE.NO_PURCHASE_ORDER);
        }

        return await this._purchaseOrderElementSrv.update(id, data, uuid);
    }

    @Mutation("deletePurchaseOrderElement")
    @Access(GRANT_TOKEN.FRONT_ACCESS)
    public async delete(@Args("id") id: number): Promise<boolean> {
        const purchaseOrder = await this._purchaseOrderSrv.getByPurchaseOrderElement(id);
        if (!(this._purchaseOrderSrv.isEditable(purchaseOrder))) {
            throw new BadRequestException(ERROR_MESSAGE.PURCHASE_ORDER_ALREADY_SENT);
        }

        return this._purchaseOrderElementSrv.delete(id);
    }

    @ResolveProperty("purchaseOrder")
    public async getPurchaseOrder(@Parent() element: PurchaseOrderElement, @UUID() uuid: string): Promise<PurchaseOrder> {
        return element.purchaseOrderId ? this._purchaseOrderSrv.getById(element.purchaseOrderId, uuid) : null;
    }

    @ResolveProperty("supplierOfferElement")
    public async getSupplierOfferElement(@Parent() element: PurchaseOrderElement, @UUID() uuid: string): Promise<SupplierOfferElement> {
        return element.supplierOfferElementId ? this._supplierOfferElementSrv.getById(element.supplierOfferElementId, uuid) : null;
    }

    @ResolveProperty("supplyCategory")
    public async getSupplyCategory(@Parent() element: PurchaseOrderElement, @UUID() uuid: string): Promise<SupplyCategory> {
        return element.supplyCategoryId ? this._supplyCategorySrv.getById(element.supplyCategoryId, uuid) : null;
    }

    @ResolveProperty("options")
    public async getOptions(@Parent() element: PurchaseOrderElement, @UUID() uuid: string): Promise<PurchaseOrderElementOption[]> {
        return !element.options ? this._purchaseOrderElementOptionSrv.getByPurchaseOrderElement(element.id, uuid) : element.options;
    }
}