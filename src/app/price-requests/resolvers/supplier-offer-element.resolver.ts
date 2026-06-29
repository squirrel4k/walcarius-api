import { Resolver, Query, Args, ResolveProperty, Parent, Mutation } from "@nestjs/graphql";
import { SupplierOfferElementService } from "../services/supplier-offer-element.service";
import { SupplierOfferElement, SupplierOfferElementUpdate, SupplierOfferElementAssociation } from "../interfaces/supplier-offer-element.interface";
import { UUID } from "../../../core/decorators/uuid.decorator";
import { SupplierOffer } from "../interfaces/supplier-offer.interface";
import { SupplierOfferService } from "../services/supplier-offer.service";
import { PriceRequestElement } from "../interfaces/price-request-element.interface";
import { PriceRequestElementService } from "../services/price-request-element.service";
import { Variant } from "../interfaces/variant.interface";
import { VariantService } from "../services/variant.service";
import { UseInterceptors } from "@nestjs/common";
import { GqlLoggerInterceptor } from "../../common/interceptors/gql-logger.interceptor";
import { Access } from "../../../core/decorators/access.decorator";
import { GRANT_TOKEN } from "../../common/jwt/jwt.interface";
import { SupplierOfferElementOption } from "../interfaces/supplier-offer-element-option.interface";
import { SupplierOfferElementOptionService } from "../services/supplier-offer-element-option.service";
import { getConnection } from "typeorm";
import { ErrorUtil } from "../../../core/utils/error.util";

@Resolver("SupplierOfferElement")
@UseInterceptors(GqlLoggerInterceptor)
export class SupplierOfferElementResolver {

    public constructor(
        private readonly _supplierOfferElementSrv: SupplierOfferElementService,
        private readonly _supplierOfferSrv: SupplierOfferService,
        private readonly _priceRequestElementSrv: PriceRequestElementService,
        private readonly _variantSrv: VariantService,
        private readonly _supplierOfferElementOptionSrv: SupplierOfferElementOptionService
    ) { }

    @Query("supplierOfferElement")
    @Access(GRANT_TOKEN.FRONT_ACCESS)
    public async getSupplierOfferElement(@Args("id") id: number, @UUID() uuid: string): Promise<SupplierOfferElement> {
        return await this._supplierOfferElementSrv.getById(id, uuid);
    }

    @Mutation("updateSupplierOfferElement")
    @Access(GRANT_TOKEN.FRONT_ACCESS)
    public async update(@Args("id") id: number, @Args("data") data: SupplierOfferElementUpdate, @UUID() uuid: string): Promise<SupplierOfferElement> {
        return await this._supplierOfferElementSrv.update(id, data, uuid);
    }


    @Mutation("associateSupplierOfferElements")
    @Access(GRANT_TOKEN.FRONT_ACCESS)
    public async associateSupplierOfferElements(@Args("data") data: SupplierOfferElementAssociation): Promise<SupplierOfferElement[]> {
        return await getConnection().transaction(async manager => {
            // Make sure IDs are really numbers
            const associatedIds: number[] = data.associatedPriceRequestElementIds.map(id => +id);
            const deletedIds: number[] = data.deletedSupplierOfferElementIds.map(id => +id);

            return await this._supplierOfferElementSrv.associateMany(data.supplierOfferId, associatedIds, deletedIds, manager);
        }).catch(err => { throw ErrorUtil.get(err); });
    }

    @ResolveProperty("supplierOffer")
    public async getSupplierOffer(@Parent() supplierOfferElement: SupplierOfferElement, @UUID() uuid: string): Promise<SupplierOffer> {
        return this._supplierOfferSrv.getById(supplierOfferElement.supplierOfferId, uuid);
    }

    @ResolveProperty("priceRequestElement")
    public async getPriceRequestElement(@Parent() supplierOfferElement: SupplierOfferElement, @UUID() uuid: string): Promise<PriceRequestElement> {
        return supplierOfferElement.priceRequestElementId ? this._priceRequestElementSrv.getById(supplierOfferElement.priceRequestElementId, uuid) : null;
    }

    @ResolveProperty("variant")
    public async getVariant(@Parent() supplierOfferElement: SupplierOfferElement, @UUID() uuid: string): Promise<Variant> {
        return supplierOfferElement.variantId ? this._variantSrv.getById(supplierOfferElement.variantId, uuid) : null;
    }

    @ResolveProperty("options")
    public async getOptions(@Parent() supplierOfferElement: SupplierOfferElement, @UUID() uuid: string): Promise<SupplierOfferElementOption[]> {
        return this._supplierOfferElementOptionSrv.getBySupplierOfferElement(supplierOfferElement.id, uuid);
    }

    @ResolveProperty("computedPrice")
    public async getComputedPrice(@Parent() supplierOfferElement: SupplierOfferElement, @UUID() uuid: string): Promise<number> {
        return this._supplierOfferElementSrv.getComputedPrice(supplierOfferElement.id, uuid);
    }
}