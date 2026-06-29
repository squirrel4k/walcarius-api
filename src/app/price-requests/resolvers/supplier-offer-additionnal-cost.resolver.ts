import { Resolver, Mutation, Args, Query, ResolveProperty, Parent } from "@nestjs/graphql";
import { SupplierOfferAdditionnalCostService } from "../services/supplier-offer-additionnal-cost.service";
import { SupplierOfferAdditionnalCostInput, SupplierOfferAdditionnalCost, SupplierOfferAdditionnalCostUpdate, SupplierOfferAdditionnalCostFilter } from "../interfaces/supplier-offer-additionnal-cost.interface";
import { UUID } from "../../../core/decorators/uuid.decorator";
import { SupplierOffer } from "../interfaces/supplier-offer.interface";
import { SupplierOfferService } from "../services/supplier-offer.service";
import { UseInterceptors } from "@nestjs/common";
import { GqlLoggerInterceptor } from "../../common/interceptors/gql-logger.interceptor";
import { Access } from "../../../core/decorators/access.decorator";
import { GRANT_TOKEN } from "../../common/jwt/jwt.interface";
import { PriceRequestAdditionnalCost } from "../interfaces/price-request-additionnal-cost.interface";
import { PriceRequestAdditionnalCostService } from "../services/price-request-additionnal-cost.service";

@Resolver("SupplierOfferAdditionnalCost")
@UseInterceptors(GqlLoggerInterceptor)
export class SupplierOfferAdditionnalCostResolver {

    public constructor(
        private readonly _supplierOfferAdditionnalCostSrv: SupplierOfferAdditionnalCostService,
        private readonly _supplierOfferSrv: SupplierOfferService,
        private readonly _priceRequestAdditionnalCostSrv: PriceRequestAdditionnalCostService
    ) { }

    @Query("supplierOfferAdditionnalCost")
    @Access(GRANT_TOKEN.FRONT_ACCESS)
    public async getById(@Args("id") id: number, @UUID() uuid: string): Promise<SupplierOfferAdditionnalCost> {
        return this._supplierOfferAdditionnalCostSrv.getById(id, uuid);
    }

    @Query("supplierOfferAdditionnalCosts")
    @Access(GRANT_TOKEN.FRONT_ACCESS)
    public async getList(@Args("filter") filter: SupplierOfferAdditionnalCostFilter): Promise<SupplierOfferAdditionnalCost[]> {
        return this._supplierOfferAdditionnalCostSrv.getList(filter);
    }

    @Mutation("createSupplierOfferAdditionnalCost")
    @Access(GRANT_TOKEN.FRONT_ACCESS)
    public async create(@Args("data") data: SupplierOfferAdditionnalCostInput): Promise<SupplierOfferAdditionnalCost> {
        return this._supplierOfferAdditionnalCostSrv.create(data);
    }

    @Mutation("updateSupplierOfferAdditionnalCost")
    @Access(GRANT_TOKEN.FRONT_ACCESS)
    public async update(@Args("id") id: number, @Args("data") data: SupplierOfferAdditionnalCostUpdate, @UUID() uuid: string): Promise<SupplierOfferAdditionnalCost> {
        return this._supplierOfferAdditionnalCostSrv.update(id, data, uuid);
    }

    @ResolveProperty("supplierOffer")
    public async getSupplierOffer(@Parent() soac: SupplierOfferAdditionnalCost, @UUID() uuid: string): Promise<SupplierOffer> {
        return soac.supplierOfferId ? this._supplierOfferSrv.getById(soac.supplierOfferId, uuid) : null;
    }

    @ResolveProperty("priceRequestAdditionnalCost")
    public async getPriceRequestAdditonnalCost(@Parent() soac: SupplierOfferAdditionnalCost, @UUID() uuid: string): Promise<PriceRequestAdditionnalCost> {
        return soac.priceRequestAdditionnalCostId ? this._priceRequestAdditionnalCostSrv.getById(soac.priceRequestAdditionnalCostId, uuid) : null;
    }
}