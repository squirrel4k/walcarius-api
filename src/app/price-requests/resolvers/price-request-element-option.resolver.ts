import { Resolver, Query, Args, Parent, ResolveProperty, Mutation } from "@nestjs/graphql";
import { PriceRequestElementOptionService } from "../services/price-request-element-option.service";
import { UseInterceptors } from "@nestjs/common";
import { GqlLoggerInterceptor } from "../../common/interceptors/gql-logger.interceptor";
import { Access } from "../../../core/decorators/access.decorator";
import { GRANT_TOKEN } from "../../common/jwt/jwt.interface";
import { PriceRequestElementOption, PriceRequestElementOptionFilter, PriceRequestElementOptionInput, PriceRequestElementOptionUpdate } from "../interfaces/price-request-element-option.interface";
import { UUID } from "../../../core/decorators/uuid.decorator";
import { PriceRequestElement } from "../interfaces/price-request-element.interface";
import { PriceRequestElementService } from "../services/price-request-element.service";
import { SupplierOfferElementOptionService } from "../services/supplier-offer-element-option.service";
import { SupplierOfferElementOption } from "../interfaces/supplier-offer-element-option.interface";
import { WinstonLogger } from "../../common/logger/winston.logger";

@Resolver("PriceRequestElementOption")
@UseInterceptors(GqlLoggerInterceptor)
export class PriceRequestElementOptionResolver {

    public constructor(
        private readonly _priceRequestElementOptionSrv: PriceRequestElementOptionService,
        private readonly _priceRequestElementSrv: PriceRequestElementService,
        private readonly _supplierOfferElementOptionSrv: SupplierOfferElementOptionService,
        private readonly _logger: WinstonLogger
    ) { }

    @Query("priceRequestElementOption")
    @Access(GRANT_TOKEN.FRONT_ACCESS)
    public async getById(@Args("id") id: number, @UUID() uuid: string): Promise<PriceRequestElementOption> {
        return this._priceRequestElementOptionSrv.getById(id, uuid);
    }

    @Query("priceRequestElementOptions")
    @Access(GRANT_TOKEN.FRONT_ACCESS)
    public async getList(@Args("filter") filter: PriceRequestElementOptionFilter): Promise<PriceRequestElementOptionFilter[]> {
        return this._priceRequestElementOptionSrv.getList(filter);
    }

    @Mutation("createPriceRequestElementOptions")
    @Access(GRANT_TOKEN.FRONT_ACCESS)
    public async create(@Args("data") data: PriceRequestElementOptionInput): Promise<PriceRequestElementOption[]> {
        return this._priceRequestElementOptionSrv.createForManyPriceRequestElements(data);
    }

    @Mutation("updatePriceRequestElementOption")
    @Access(GRANT_TOKEN.FRONT_ACCESS)
    public async update(@Args("id") id: number, @Args("data") data: PriceRequestElementOptionUpdate, @UUID() uuid: string): Promise<PriceRequestElementOption> {
        return this._priceRequestElementOptionSrv.update(id, data, uuid);
    }

    @Mutation("deletePriceRequestElementOption")
    @Access(GRANT_TOKEN.FRONT_ACCESS)
    public async delete(@Args("id") id: number): Promise<boolean> {
        const deleted = await this._supplierOfferElementOptionSrv.deleteByPriceRequestElementOptions([id]);
        if (!deleted) { this._logger.warn(`Couldn't remove SupplierOfferElementOptions for PriceRequestElementOption [${id}]`); }

        return this._priceRequestElementOptionSrv.delete(id);
    }

    @ResolveProperty("bestPrice")
    public async getBestPrice(@Parent() option: PriceRequestElementOption, @UUID() uuid: string): Promise<number> {
        return this._priceRequestElementOptionSrv.getBestPrice(option.id, uuid);
    }

    @ResolveProperty("priceRequestElement")
    public async getPriceRequestElement(@Parent() option: PriceRequestElementOption, @UUID() uuid: string): Promise<PriceRequestElement> {
        return option.priceRequestElementId ? this._priceRequestElementSrv.getById(option.priceRequestElementId, uuid) : null;
    }

    @ResolveProperty("supplierOfferElementOptions")
    public async getSupplierOfferElementOption(@Parent() option: PriceRequestElementOption, @UUID() uuid: string): Promise<SupplierOfferElementOption[]> {
        return this._supplierOfferElementOptionSrv.getByPriceRequestElementOption(option.id, uuid);
    }
}