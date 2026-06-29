import { Resolver, ResolveProperty, Parent, Query, Args, Mutation } from "@nestjs/graphql";
import { SupplierOfferElementOptionService } from "../services/supplier-offer-element-option.service";
import { SupplierOfferElementService } from "../services/supplier-offer-element.service";
import { PriceRequestElementOptionService } from "../services/price-request-element-option.service";
import { SupplierOfferElementOption, SupplierOfferElementOptionFilter, SupplierOfferElementOptionInput, SupplierOfferElementOptionUpdate } from "../interfaces/supplier-offer-element-option.interface";
import { UUID } from "../../../core/decorators/uuid.decorator";
import { SupplierOfferElement } from "../interfaces/supplier-offer-element.interface";
import { PriceRequestElementOption } from "../interfaces/price-request-element-option.interface";
import { UseInterceptors } from "@nestjs/common";
import { GqlLoggerInterceptor } from "../../common/interceptors/gql-logger.interceptor";
import { Access } from "../../../core/decorators/access.decorator";
import { GRANT_TOKEN } from "../../common/jwt/jwt.interface";

@Resolver("SupplierOfferElementOption")
@UseInterceptors(GqlLoggerInterceptor)
export class SupplierOfferElementOptionResolver {

    public constructor(
        private readonly _supplierOfferElementOptionSrv: SupplierOfferElementOptionService,
        private readonly _supplierOfferElementSrv: SupplierOfferElementService,
        private readonly _priceRequestElementOptionSrv: PriceRequestElementOptionService
    ) { }

    @Query("supplierOfferElementOption")
    @Access(GRANT_TOKEN.FRONT_ACCESS)
    public async getById(@Args("id") id: number, @UUID() uuid: string): Promise<SupplierOfferElementOption> {
        return this._supplierOfferElementOptionSrv.getById(id, uuid);
    }

    @Query("supplierOfferElementOptions")
    @Access(GRANT_TOKEN.FRONT_ACCESS)
    public async getList(@Args("filter") filter: SupplierOfferElementOptionFilter): Promise<SupplierOfferElementOption[]> {
        return this._supplierOfferElementOptionSrv.getList(filter);
    }

    @Mutation("createSupplierOfferElementOption")
    @Access(GRANT_TOKEN.FRONT_ACCESS)
    public async create(@Args("data") data: SupplierOfferElementOptionInput): Promise<SupplierOfferElementOption> {
        return this._supplierOfferElementOptionSrv.create(data);
    }

    @Mutation("updateSupplierOfferElementOption")
    @Access(GRANT_TOKEN.FRONT_ACCESS)
    public async update(@Args("id") id: number, @Args("data") data: SupplierOfferElementOptionUpdate, @UUID() uuid: string): Promise<SupplierOfferElementOption> {
        return this._supplierOfferElementOptionSrv.update(id, data, uuid);
    }

    @Mutation("deleteSupplierOfferElementOption")
    @Access(GRANT_TOKEN.FRONT_ACCESS)
    public async delete(@Args("id") id: number): Promise<boolean> {
        return this._supplierOfferElementOptionSrv.delete(id);
    }

    @ResolveProperty("supplierOfferElement")
    public async getSupplierOfferElement(@Parent() option: SupplierOfferElementOption, @UUID() uuid: string): Promise<SupplierOfferElement> {
        return option.supplierOfferElementId ? this._supplierOfferElementSrv.getById(option.supplierOfferElementId, uuid) : null;
    }

    @ResolveProperty("priceRequestElementOption")
    public async getPriceRequestElementOption(@Parent() option: SupplierOfferElementOption, @UUID() uuid: string): Promise<PriceRequestElementOption> {
        return option.priceRequestElementOptionId ? this._priceRequestElementOptionSrv.getById(option.priceRequestElementOptionId, uuid) : null;
    }
}