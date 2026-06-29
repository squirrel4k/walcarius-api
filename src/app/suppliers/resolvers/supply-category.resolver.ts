import { Resolver, Query, Args, ResolveProperty, Parent, Mutation } from "@nestjs/graphql";
import { UseInterceptors } from "@nestjs/common";
import { GqlLoggerInterceptor } from "../../common/interceptors/gql-logger.interceptor";
import { SupplyCategory, SelectedSupplyCategory, SelectedSupplyCategoryInput } from "../interfaces/supply-category.interface";
import { Access } from "../../../core/decorators/access.decorator";
import { GRANT_TOKEN } from "../../common/jwt/jwt.interface";
import { SupplyCategoryService } from "../services/supply-category.service";
import { ElementGroup } from "../../elements/interfaces/element-group.interface";
import { UUID } from "../../../core/decorators/uuid.decorator";
import { ElementGroupService } from "../../elements/services/element-group.service";
import { NatureBySupplyCategoryLoader } from "../loaders/nature-by-supply-category.loader";
import { Nature } from "../../elements/interfaces/nature.interface";
import { SupplierService } from "../services/supplier.service";
import { Supplier } from "../interfaces/supplier.interface";

@Resolver("SupplyCategory")
@UseInterceptors(GqlLoggerInterceptor)
export class SupplyCategoryResolver {

    public constructor (
        private readonly _supplyCategorySrv: SupplyCategoryService,
        private readonly _elementGroupSrv: ElementGroupService,
        private readonly _supplierSrv: SupplierService
    ) { }

    @Query("supplyCategories")
    @Access(GRANT_TOKEN.FRONT_ACCESS)
    public async getSupplyCategories(@Args("parentSupplyCategoryId") parentSupplyCategoryId: number): Promise<SupplyCategory[]> {
        return this._supplyCategorySrv.getList(parentSupplyCategoryId);
    }

    @Query("supplyCategory")
    @Access(GRANT_TOKEN.FRONT_ACCESS)
    public async getSupplyCategory(@Args("id") id: number, @UUID() uuid: string): Promise<SupplyCategory> {
        return this._supplyCategorySrv.getById(id, uuid);
    }

    @Query("supplyCategoriesBySupplier")
    @Access(GRANT_TOKEN.FRONT_ACCESS)
    public async supplyCategoriesBySupplier(@Args("supplierId") supplierId: number): Promise<SelectedSupplyCategory[]> {
        return this._supplyCategorySrv.getSelectedBySupplier(supplierId);
    }

    @Mutation("setSupplyCategoriesOfSupplier")
    @Access(GRANT_TOKEN.FRONT_ACCESS)
    public async setSupplyCategoriesOfSupplier(@Args("supplierId") supplierId: number, @Args("data") data: SelectedSupplyCategoryInput[]): Promise<boolean> {
        return this._supplyCategorySrv.setSelectedForSupplier(supplierId, data);
    }


    @ResolveProperty("subCategories")
    public async getSubCategories(@Parent() supplyCategory: SupplyCategory, @UUID() uuid: string): Promise<SupplyCategory[]> {
        return this._supplyCategorySrv.getSubSupplyCategories(supplyCategory.id, uuid);
    }

    @ResolveProperty("parentSupplyCategory")
    public async getParentCategory(@Parent() supplyCategory: SupplyCategory, @UUID() uuid: string): Promise<SupplyCategory> {
        return supplyCategory.parentSupplyCategoryId ? await this._supplyCategorySrv.getById(supplyCategory.parentSupplyCategoryId, uuid) : null;
    }

    @ResolveProperty("elementGroup")
    public async getElementGroup(@Parent() supplyCategory: SupplyCategory, @UUID() uuid: string): Promise<ElementGroup> {
        return supplyCategory.elementGroupId ? await this._elementGroupSrv.getById(supplyCategory.elementGroupId, uuid) : null;
    }

    @ResolveProperty("fields")
    public async getFields(@Parent() supplyCategory: SupplyCategory, @UUID() uuid: string): Promise<Nature[]> {
        return this._supplyCategorySrv.getFields(supplyCategory.id, uuid);
    }

    @ResolveProperty("suppliers")
    public async getSuppliers(@Parent() supplyCategory: SupplyCategory, @UUID() uuid: string): Promise<Supplier[]> {
        return this._supplierSrv.getListBySupplyCategory(supplyCategory.id, uuid);
    }
}