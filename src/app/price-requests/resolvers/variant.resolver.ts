import { Resolver, ResolveProperty, Parent, Query, Args } from "@nestjs/graphql";
import { Variant } from "../interfaces/variant.interface";
import { UUID } from "../../../core/decorators/uuid.decorator";
import { SupplyCategory } from "../../suppliers/interfaces/supply-category.interface";
import { SupplyCategoryService } from "../../suppliers/services/supply-category.service";
import { Element } from "../../elements/interfaces/element.interface";
import { ElementService } from "../../elements/services/element.service";
import { MatterService } from "../../elements/services/matter.service";
import { Matter } from "../../elements/interfaces/matter.interface";
import { VariantService } from "../services/variant.service";
import { UseInterceptors } from "@nestjs/common";
import { GqlLoggerInterceptor } from "../../common/interceptors/gql-logger.interceptor";
import { Access } from "../../../core/decorators/access.decorator";
import { GRANT_TOKEN } from "../../common/jwt/jwt.interface";
import { VariantOption } from "../interfaces/variant-option.interface";
import { VariantOptionService } from "../services/variant-option.service";
import { WeightCalculatorManager } from "../managers/weight-calculator.manager";
import { WeightData } from "../interfaces/weight-calculator.interface";

@Resolver("Variant")
@UseInterceptors(GqlLoggerInterceptor)
export class VariantResolver {

    public constructor(
        private readonly _variantSrv: VariantService,
        private readonly _supplyCategorySrv: SupplyCategoryService,
        private readonly _elementSrv: ElementService,
        private readonly _matterSrv: MatterService,
        private readonly _variantOptionSrv: VariantOptionService,
        private readonly _weightCalculatorMgr: WeightCalculatorManager
    ) { }

    @Query("variant")
    @Access(GRANT_TOKEN.FRONT_ACCESS)
    public async getById(@Args("id") id: number, @UUID() uuid: string): Promise<Variant> {
        return this._variantSrv.getById(id, uuid);
    }

    @Query("getVariantWeight")
    @Access(GRANT_TOKEN.FRONT_ACCESS)
    public async getVariantWeight(@Args("data") data: WeightData, @UUID() uuid: string): Promise<number> {
        const matter = data.matterId ? await this._matterSrv.getById(data.matterId, uuid) : null;
        const unitWeight = await this._weightCalculatorMgr.getWeight(data, [matter], uuid);

        return data.quantity * unitWeight;
    }

    @ResolveProperty("supplyCategory")
    public async getSupplyCategory(@Parent() variant: Variant, @UUID() uuid: string): Promise<SupplyCategory> {
        return variant.supplyCategoryId ? this._supplyCategorySrv.getById(variant.supplyCategoryId, uuid) : null;
    }

    @ResolveProperty("element")
    public async getElement(@Parent() variant: Variant, @UUID() uuid: string): Promise<Element> {
        return variant.elementId ? this._elementSrv.getById(variant.elementId, uuid) : null;
    }

    @ResolveProperty("matter")
    public async getMatter(@Parent() variant: Variant, @UUID() uuid: string): Promise<Matter> {
        return variant.matterId ? this._matterSrv.getById(variant.matterId, uuid) : null;
    }

    @ResolveProperty("options")
    public async getVariantOptions(@Parent() variant: Variant, @UUID() uuid: string): Promise<VariantOption[]> {
        return this._variantOptionSrv.getByVariant(variant.id, uuid);
    }

    @ResolveProperty("purchaseOrderQuantity")
    public async getPurchaseOrderQuantity(@Parent() variant: Variant, @UUID() uuid: string): Promise<number> {
        return this._variantSrv.getPurchaseOrderQuantity(variant.id, uuid);
    }
}