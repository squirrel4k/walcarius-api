import { Resolver, Mutation, Args, Query, ResolveField, Parent } from "@nestjs/graphql";
import { VariantOptionService } from "../services/variant-option.service";
import { UseInterceptors } from "@nestjs/common";
import { GqlLoggerInterceptor } from "../../common/interceptors/gql-logger.interceptor";
import { Access } from "../../../core/decorators/access.decorator";
import { GRANT_TOKEN } from "../../common/jwt/jwt.interface";
import { VariantOptionInput, VariantOption, VariantOptionFilter, VariantOptionUpdate } from "../interfaces/variant-option.interface";
import { UUID } from "../../../core/decorators/uuid.decorator";
import { VariantService } from "../services/variant.service";
import { Variant } from "../interfaces/variant.interface";

@Resolver("VariantOption")
@UseInterceptors(GqlLoggerInterceptor)
export class VariantOptionResolver {

    public constructor(
        private readonly _variantOptionSrv: VariantOptionService,
        private readonly _variantSrv: VariantService
    ) { }

    @Query("variantOption")
    @Access(GRANT_TOKEN.FRONT_ACCESS)
    public async getById(@Args("id") id: number, @UUID() uuid: string): Promise<VariantOption> {
        return this._variantOptionSrv.getById(id, uuid);
    }

    @Query("variantOptions")
    @Access(GRANT_TOKEN.FRONT_ACCESS)
    public async getList(@Args("filter") filter: VariantOptionFilter): Promise<VariantOption[]> {
        return this._variantOptionSrv.getList(filter);
    }

    @Mutation("createVariantOption")
    @Access(GRANT_TOKEN.FRONT_ACCESS)
    public async create(@Args("data") data: VariantOptionInput): Promise<VariantOption> {
        return this._variantOptionSrv.create(data);
    }

    @Mutation("updateVariantOption")
    @Access(GRANT_TOKEN.FRONT_ACCESS)
    public async update(@Args("id") id: number, @Args("data") data: VariantOptionUpdate, @UUID() uuid: string): Promise<VariantOption> {
        return this._variantOptionSrv.update(id, data, uuid);
    }

    @Mutation("deleteVariantOption")
    @Access(GRANT_TOKEN.FRONT_ACCESS)
    public async delete(@Args("id") id: number): Promise<boolean> {
        return this._variantOptionSrv.delete(id);
    }

    @ResolveField("variant")
    public async getVariant(@Parent() option: VariantOption, @UUID() uuid: string): Promise<Variant> {
        return option.variantId ? this._variantSrv.getById(option.variantId, uuid) : null;
    }
}