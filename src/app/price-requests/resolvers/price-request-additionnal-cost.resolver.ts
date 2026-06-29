import { Resolver, ResolveProperty, Parent, Query, Args, Mutation } from "@nestjs/graphql";
import { PriceRequestAdditionnalCostService } from "../services/price-request-additionnal-cost.service";
import { PriceRequestService } from "../services/price-request.service";
import { PriceRequestAdditionnalCost, PriceRequestAdditionnalCostFilter, PriceRequestAdditionnalCostInput, PriceRequestAdditionnalCostUpdate } from "../interfaces/price-request-additionnal-cost.interface";
import { UUID } from "../../../core/decorators/uuid.decorator";
import { PriceRequest } from "../interfaces/price-request.interface";
import { UseInterceptors } from "@nestjs/common";
import { GqlLoggerInterceptor } from "../../common/interceptors/gql-logger.interceptor";
import { SupplierOfferAdditionnalCost } from "../interfaces/supplier-offer-additionnal-cost.interface";
import { SupplierOfferAdditionnalCostService } from "../services/supplier-offer-additionnal-cost.service";
import { Access } from "../../../core/decorators/access.decorator";
import { GRANT_TOKEN } from "../../common/jwt/jwt.interface";
import { getConnection } from "typeorm";
import { ErrorUtil } from "../../../core/utils/error.util";

@Resolver("PriceRequestAdditionnalCost")
@UseInterceptors(GqlLoggerInterceptor)
export class PriceRequestAdditionnalCostResolver {

    public constructor(
        private readonly _priceRequestAdditionnalCostSrv: PriceRequestAdditionnalCostService,
        private readonly _priceRequestSrv: PriceRequestService,
        private readonly _supplierOfferAdditionnalCostSrv: SupplierOfferAdditionnalCostService
    ) { }

    @Query("priceRequestAdditionnalCost")
    @Access(GRANT_TOKEN.FRONT_ACCESS)
    public async getById(@Args("id") id: number, @UUID() uuid: string): Promise<PriceRequestAdditionnalCost> {
        return this._priceRequestAdditionnalCostSrv.getById(id, uuid);
    }

    @Query("priceRequestAdditionnalCosts")
    @Access(GRANT_TOKEN.FRONT_ACCESS)
    public async getList(@Args("filter") filter: PriceRequestAdditionnalCostFilter): Promise<PriceRequestAdditionnalCost[]> {
        return this._priceRequestAdditionnalCostSrv.getList(filter);
    }

    @Mutation("createPriceRequestAdditionnalCost")
    @Access(GRANT_TOKEN.FRONT_ACCESS)
    public async create(@Args("data") data: PriceRequestAdditionnalCostInput): Promise<PriceRequestAdditionnalCost> {
        return this._priceRequestAdditionnalCostSrv.create(data);
    }

    @Mutation("updatePriceRequestAdditionnalCost")
    @Access(GRANT_TOKEN.FRONT_ACCESS)
    public async update(@Args("id") id: number, @Args("data") data: PriceRequestAdditionnalCostUpdate, @UUID() uuid): Promise<PriceRequestAdditionnalCost> {
        return this._priceRequestAdditionnalCostSrv.update(id, data, uuid);
    }

    @Mutation("deletePriceRequestAdditionnalCost")
    @Access(GRANT_TOKEN.FRONT_ACCESS)
    public async deletePriceRequestAdditionnalCost(@Args("id") id: number): Promise<boolean> {
        return await getConnection().transaction(async manager => {
            await this._supplierOfferAdditionnalCostSrv.deleteBy({ priceRequestAdditionnalCostId: id }, manager);
            return this._priceRequestAdditionnalCostSrv.delete(id, manager);
        }).catch(err => { throw ErrorUtil.get(err); });
    }

    @ResolveProperty("priceRequest")
    public async getPriceRequest(@Parent() prac: PriceRequestAdditionnalCost, @UUID() uuid: string): Promise<PriceRequest> {
        return prac.priceRequestId ? this._priceRequestSrv.getById(prac.priceRequestId, uuid) : null;
    }

    @ResolveProperty("supplierOfferAdditionnalCosts")
    public async getSupplierOfferAddtionnalCosts(@Parent() prac: PriceRequestAdditionnalCost, @UUID() uuid: string): Promise<SupplierOfferAdditionnalCost[]> {
        return this._supplierOfferAdditionnalCostSrv.getByPriceRequestAdditionnalCost(prac.id, uuid);
    }

    @ResolveProperty("bestPrice")
    public async getBestPrice(@Parent() prac: PriceRequestAdditionnalCost, @UUID() uuid: string): Promise<number> {
        return this._priceRequestAdditionnalCostSrv.getBestPrice(prac.id, uuid);
    }
}