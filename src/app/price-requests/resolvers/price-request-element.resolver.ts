import { Resolver, Query, Args, ResolveField, Parent, Mutation } from "@nestjs/graphql";
import { PriceRequestElementService } from "../services/price-request-element.service";
import { PriceRequestElementFilter, PriceRequestElement, PriceRequestElementUpdate } from "../interfaces/price-request-element.interface";
import { UseInterceptors } from "@nestjs/common";
import { GqlLoggerInterceptor } from "../../common/interceptors/gql-logger.interceptor";
import { Access } from "../../../core/decorators/access.decorator";
import { GRANT_TOKEN } from "../../common/jwt/jwt.interface";
import { UUID } from "../../../core/decorators/uuid.decorator";
import { AmalgamGroup } from "../interfaces/amalgam-group.interface";
import { AmalgamGroupService } from "../services/amalgam-group.service";
import { SupplyListElementService } from "../../projects/services/supply-list-element.service";
import { SupplyListElement } from "../../projects/interfaces/supply-list-element.interface";
import { PriceRequest } from "../interfaces/price-request.interface";
import { PriceRequestService } from "../services/price-request.service";
import { SupplierOfferElement } from "../interfaces/supplier-offer-element.interface";
import { SupplierOfferElementService } from "../services/supplier-offer-element.service";
import { SupplyCategory } from "../../suppliers/interfaces/supply-category.interface";
import { PriceRequestElementOption } from "../interfaces/price-request-element-option.interface";
import { PriceRequestElementOptionService } from "../services/price-request-element-option.service";
import { DataSource } from "typeorm";
import { ErrorUtil } from "../../../core/utils/error.util";

@Resolver("PriceRequestElement")
@UseInterceptors(GqlLoggerInterceptor)
export class PriceRequestElementResolver {

    constructor(
        private readonly _dataSource: DataSource,
        private readonly _priceRequestElementSrv: PriceRequestElementService,
        private readonly _amalgamGroupSrv: AmalgamGroupService,
        private readonly _supplyListElementSrv: SupplyListElementService,
        private readonly _priceRequestSrv: PriceRequestService,
        private readonly _supplierOfferElementSrv: SupplierOfferElementService,
        private readonly _priceRequestElementOptionSrv: PriceRequestElementOptionService
    ) { }

    @Query("priceRequestElement")
    @Access(GRANT_TOKEN.FRONT_ACCESS)
    public async getById(@Args("id") id: number, @UUID() uuid: string): Promise<PriceRequestElement> {
        return this._priceRequestElementSrv.getById(id, uuid);
    }

    @Query("priceRequestElements")
    @Access(GRANT_TOKEN.FRONT_ACCESS)
    public async getList(@Args("filter") filter: PriceRequestElementFilter): Promise<PriceRequestElement[]> {
        return this._priceRequestElementSrv.getList(filter);
    }

    @Mutation("updatePriceRequestElement")
    @Access(GRANT_TOKEN.FRONT_ACCESS)
    public async update(@Args("id") id: number, @Args("data") data: PriceRequestElementUpdate): Promise<PriceRequestElement> {
        return await this._dataSource.transaction(async manager => {
            return (await this._priceRequestElementSrv.updateMany([{ id, ...data }], manager)).shift();
        }).catch(err => { throw ErrorUtil.get(err); });

    }

    @ResolveField("amalgamGroup")
    public async getAmalgamGroup(@Parent() element: PriceRequestElement, @UUID() uuid: string): Promise<AmalgamGroup> {
        return element.amalgamGroupId ? this._amalgamGroupSrv.getById(element.amalgamGroupId, uuid) : null;
    }

    @ResolveField("supplyListElement")
    public async getSupplyListElement(@Parent() element: PriceRequestElement, @UUID() uuid: string): Promise<SupplyListElement> {
        return element.supplyListElementId ? this._supplyListElementSrv.getById(element.supplyListElementId, uuid) : null;
    }

    @ResolveField("priceRequest")
    public async getPriceRequest(@Parent() element: PriceRequestElement, @UUID() uuid: string): Promise<PriceRequest> {
        return this._priceRequestSrv.getById(element.priceRequestId, uuid);
    }

    @ResolveField("bestPrice")
    public async getBestPrice(@Parent() element: PriceRequestElement, @UUID() uuid: string): Promise<number> {
        return this._priceRequestElementSrv.getBestPrice(element.id, uuid);
    }

    @ResolveField("bestTime")
    public async getBestDeliveryDate(@Parent() element: PriceRequestElement, @UUID() uuid: string): Promise<Date> {
        return await this._priceRequestElementSrv.getBestTime(element.id, uuid);
    }

    @ResolveField("supplierOfferElements")
    public async getSupplierOfferElements(@Parent() element: PriceRequestElement, @UUID() uuid: string): Promise<SupplierOfferElement[]> {
        return await this._supplierOfferElementSrv.getByPriceRequestElement(element.id, uuid);
    }

    @ResolveField("parentSupplyCategory")
    public async getParentSupplyCategory(@Parent() element: PriceRequestElement, @UUID() uuid: string): Promise<SupplyCategory> {
        return this._priceRequestElementSrv.getParentSupplyCategory(element.id, uuid);
    }

    @ResolveField("stockQuantity")
    public async getStockQuantity(@Parent() element: PriceRequestElement, @UUID() uuid: string): Promise<number> {
        return element.amalgamGroupId ? this._amalgamGroupSrv.getStockQuantity(element.amalgamGroupId, uuid) : 0;
    }

    @ResolveField("purchaseOrderQuantity")
    public async getPurchaseOrderQuantity(@Parent() element: PriceRequestElement, @UUID() uuid: string): Promise<number> {
        return this._priceRequestElementSrv.getPurchaseOrderQuantity(element.id, uuid);
    }

    @ResolveField("options")
    public async getPriceRequestElementOptions(@Parent() element: PriceRequestElement, @UUID() uuid: string): Promise<PriceRequestElementOption[]> {
        return this._priceRequestElementOptionSrv.getByPriceRequestElement(element.id, uuid);
    }

    @ResolveField("hasPrice")
    public async getHasPrice(@Parent() element: PriceRequestElement, @UUID() uuid: string): Promise<boolean> {
        return this._priceRequestElementSrv.getHasPrice(element.id, uuid);
    }
}