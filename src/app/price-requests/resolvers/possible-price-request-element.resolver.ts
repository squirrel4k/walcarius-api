import { Resolver, ResolveProperty, Parent } from "@nestjs/graphql";
import { PossiblePriceRequestElement } from "../interfaces/price-request-element.interface";
import { SupplyListElement } from "../../projects/interfaces/supply-list-element.interface";
import { SupplyListElementService } from "../../projects/services/supply-list-element.service";
import { UUID } from "../../../core/decorators/uuid.decorator";
import { AmalgamGroup } from "../interfaces/amalgam-group.interface";
import { SupplierOfferElement } from "../interfaces/supplier-offer-element.interface";
import { AmalgamGroupService } from "../services/amalgam-group.service";
import { SupplierOfferElementService } from "../services/supplier-offer-element.service";
import { UseInterceptors } from "@nestjs/common";
import { GqlLoggerInterceptor } from "../../common/interceptors/gql-logger.interceptor";
import { SupplyCategory } from "../../suppliers/interfaces/supply-category.interface";
import { PriceRequestElementService } from "../services/price-request-element.service";
import { PriceRequestElementOption } from "../interfaces/price-request-element-option.interface";
import { PriceRequestElementOptionService } from "../services/price-request-element-option.service";

@Resolver("PossiblePriceRequestElement")
@UseInterceptors(GqlLoggerInterceptor)
export class PossiblePriceRequestElementResolver {

    public constructor (
        private readonly _supplyListElementSrv: SupplyListElementService,
        private readonly _amalgamGroupSrv: AmalgamGroupService,
        private readonly _supplierOfferElementSrv: SupplierOfferElementService,
        private readonly _priceRequestElementSrv: PriceRequestElementService,
        private readonly _priceRequestElementOptionSrv: PriceRequestElementOptionService
    ) { }

    @ResolveProperty("supplyListElement")
    public async getSupplyListElement(@Parent() element: PossiblePriceRequestElement, @UUID() uuid: string): Promise<SupplyListElement> {
        return element.supplyListElementId ? this._supplyListElementSrv.getById(element.supplyListElementId, uuid) : null;
    }

    @ResolveProperty("amalgamGroup")
    public async getAmalgamGroup(@Parent() element: PossiblePriceRequestElement, @UUID() uuid: string): Promise<AmalgamGroup> {
        return element.amalgamGroupId ? this._amalgamGroupSrv.getById(element.amalgamGroupId, uuid) : null;
    }

    @ResolveProperty("supplierOfferElements")
    public async getSupplierOfferElement(@Parent() element: PossiblePriceRequestElement, @UUID() uuid: string): Promise<SupplierOfferElement[]> {
        return await this._supplierOfferElementSrv.getByPossiblePriceRequestElement(element.id, element.supplierOfferId, uuid);
    }

    @ResolveProperty("parentSupplyCategory")
    public async getParentSupplYCategory(@Parent() element: PossiblePriceRequestElement, @UUID() uuid: string): Promise<SupplyCategory> {
        return this._priceRequestElementSrv.getParentSupplyCategory(element.id, uuid);
    }

    @ResolveProperty("bestPrice")
    public async getBestPrice(@Parent() element: PossiblePriceRequestElement, @UUID() uuid: string): Promise<number> {
        return this._priceRequestElementSrv.getBestPrice(element.id, uuid);
    }

    @ResolveProperty("bestTime")
    public async getBestTime(@Parent() element: PossiblePriceRequestElement, @UUID() uuid: string): Promise<Date> {
        return this._priceRequestElementSrv.getBestTime(element.id, uuid);
    }

    @ResolveProperty("stockQuantity")
    public async getStockQuantity(@Parent() element: PossiblePriceRequestElement, @UUID() uuid: string): Promise<number> {
        return element.amalgamGroupId ? this._amalgamGroupSrv.getStockQuantity(element.amalgamGroupId, uuid) : 0;
    }

    @ResolveProperty("purchaseOrderQuantity")
    public async getPurchaseOrderQuantity(@Parent() element: PossiblePriceRequestElement, @UUID() uuid: string): Promise<number> {
        return this._priceRequestElementSrv.getPurchaseOrderQuantity(element.id, uuid);
    }

    @ResolveProperty("options")
    public async getPriceRequestElementOptions(@Parent() element: PossiblePriceRequestElement, @UUID() uuid: string): Promise<PriceRequestElementOption[]> {
        return this._priceRequestElementOptionSrv.getByPriceRequestElement(element.id, uuid);
    }

    @ResolveProperty("hasPrice")
    public async getHasPrice(@Parent() element: PossiblePriceRequestElement, @UUID() uuid: string): Promise<boolean> {
        return this._priceRequestElementSrv.getHasPrice(element.id, uuid);
    }
}