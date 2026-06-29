import { Resolver, Query, Args, Mutation, ResolveProperty, Parent, Context } from "@nestjs/graphql";
import { Supplier, SupplierInput, SupplierUpdate, SelectedMattersInput, SelectedMatter } from "../interfaces/supplier.interface";
import { SupplierService } from "../services/supplier.service";
import { Access } from "../../../core/decorators/access.decorator";
import { GRANT_TOKEN } from "../../common/jwt/jwt.interface";
import { UseInterceptors, BadRequestException } from "@nestjs/common";
import { GqlLoggerInterceptor } from "../../common/interceptors/gql-logger.interceptor";
import { SupplierContactService } from "../services/supplier-contact.service";
import { SupplierContact } from "../interfaces/supplier-contact.interface";
import { UUID } from "../../../core/decorators/uuid.decorator";
import { SupplyCategory } from "../interfaces/supply-category.interface";
import { SupplyCategoryService } from "../services/supply-category.service";
import { getConnection, IsNull, Not } from "typeorm";
import { ErrorUtil } from "../../../core/utils/error.util";
import { ERROR_MESSAGE } from "../../../core/errors/enum/error.enum";
import { Matter } from "../../elements/interfaces/matter.interface";
import { SupplierMatterService } from "../services/supplier-matter.service";
import { MatterService } from "../../elements/services/matter.service";
import { Pagination } from "../../../core/interfaces/crud.interface";
import { PERMISSION_CATEGORIES } from "../../users/enums/permissioncategories.enum";
import { PERMISSION_TYPES } from "../../users/enums/permissiontypes.enum";
import { AuthService } from "../../auth/auth.service";

@Resolver("Supplier")
@UseInterceptors(GqlLoggerInterceptor)
export class SupplierResolver {

    public constructor (
        private readonly _supplierSrv: SupplierService,
        private readonly _supplierContactSrv: SupplierContactService,
        private readonly _supplyCategorySrv: SupplyCategoryService,
        private readonly _supplierMatterSrv: SupplierMatterService,
        private readonly _matterSrv: MatterService,
        private readonly _authSrv : AuthService
    ) { }

    @Query("suppliers")
    @Access(GRANT_TOKEN.FRONT_ACCESS)
    public async getSuppliers(
        @Args("deleted") isDeleted: boolean,
        @Args("pagination") pagination: Pagination,
        @Args("search") search: string,
        @Context() ctx: any
    ): Promise<Supplier[]> {
        const result = await this._supplierSrv.frontList({ isDeleted, search }, null, pagination);
        ctx.pagination = result.pagination;

        //check permission read list suppliers
        let readpermisssion = this._authSrv.authorized(ctx.req.user.userGroup,PERMISSION_CATEGORIES.SUPPLIERS,PERMISSION_TYPES.READ);
        if(readpermisssion){
            return result.data;
        }else{
            throw new BadRequestException(ERROR_MESSAGE.FORBIDDEN);
        }
        
    }

    @Query("supplier")
    @Access(GRANT_TOKEN.FRONT_ACCESS)
    public async getSupplier(@Args("id") id: number, @UUID() uuid: string): Promise<Supplier> {
        return this._supplierSrv.getById(id, uuid);
    }

    @Query("mattersBySupplier")
    @Access(GRANT_TOKEN.FRONT_ACCESS)
    public async getMattersBySupplier(@Args("supplierId") supplierId: number): Promise<SelectedMatter[]> {
        const allMatters: Matter[] = await this._matterSrv.matterList(false);

        return this._supplierMatterSrv.getSelectedMatter(supplierId, allMatters);
    }

    @Mutation("createSupplier")
    @Access(GRANT_TOKEN.FRONT_ACCESS)
    public async createSupplier(@Args("data") data: SupplierInput): Promise<Supplier> {
        const existingCodes = await this._supplierSrv.getBy({ code: data.code, deletedAt: IsNull() });
        if (existingCodes.length > 0) {
            throw new BadRequestException(ERROR_MESSAGE.SUPPLIER_CODE_ALREADY_EXISTS);
        }

        return this._supplierSrv.create(data);
    }

    @Mutation("deleteSupplier")
    @Access(GRANT_TOKEN.FRONT_ACCESS)
    public async deleteSupplier(@Args("id") id: number, @Context() ctx: any): Promise<boolean> {
        //check permission delete suppliers
        let deletepermisssion = this._authSrv.authorized(ctx.req.user.userGroup,PERMISSION_CATEGORIES.SUPPLIERS,PERMISSION_TYPES.DELETE);
        if(deletepermisssion){
            return await getConnection().transaction(async transaction => {
                const deletedContacts = await this._supplierContactSrv.deleteBy({ supplierId: id }, transaction);
    
                return this._supplierSrv.delete(id);
            }).catch(err => { throw ErrorUtil.get(err); });
        }else{
            throw new BadRequestException(ERROR_MESSAGE.FORBIDDEN);
        }
    }

    @Mutation("updateSupplier")
    @Access(GRANT_TOKEN.FRONT_ACCESS)
    public async updateSupplier(@Args("id") id: number, @Args("data") data: SupplierUpdate, @UUID() uuid: string, @Context() ctx: any): Promise<Supplier> {
        let updatepermisssion = this._authSrv.authorized(ctx.req.user.userGroup,PERMISSION_CATEGORIES.SUPPLIERS,PERMISSION_TYPES.WRITE);
        if(updatepermisssion){
            const existingCodes = await this._supplierSrv.getBy({ code: data.code, deletedAt: IsNull(), id: Not(id) });
        if (existingCodes.length > 0) {
            throw new BadRequestException(ERROR_MESSAGE.SUPPLIER_CODE_ALREADY_EXISTS);
        }

        return this._supplierSrv.update(id, data, uuid);
        }else{
            throw new BadRequestException(ERROR_MESSAGE.FORBIDDEN);
        }
    }

    @Mutation("setMattersOfSupplier")
    @Access(GRANT_TOKEN.FRONT_ACCESS)
    public async setMattersOfSupplier(@Args("supplierId") supplierId: number, @Args("data") data: SelectedMattersInput[]): Promise<boolean> {
        return getConnection().transaction(async manager => {
            return this._supplierMatterSrv.setSelectedMatterForSupplier(supplierId, data, manager);
        });
    }

    @ResolveProperty("contacts")
    public async getSupplierContacts(@Parent() supplier: Supplier, @UUID() uuid: string): Promise<SupplierContact[]> {
        return this._supplierContactSrv.getListBySupplier(supplier.id, uuid);
    }

    @ResolveProperty("allSupplyCategories")
    public async getAllSupplyCategories(@Parent() supplier: Supplier, @UUID() uuid: string): Promise<SupplyCategory[]> {
        return this._supplyCategorySrv.getBySupplier(supplier.id, uuid);
    }

    @ResolveProperty("parentSupplyCategories")
    public async getParentSupplyCategories(@Parent() supplier: Supplier, @UUID() uuid: string): Promise<SupplyCategory[]> {
        return this._supplyCategorySrv.getParentBySupplier(supplier.id, uuid);
    }

    @ResolveProperty("matters")
    public async getMatters(@Parent() supplier: Supplier, @UUID() uuid: string): Promise<Matter[]> {
        return this._supplierSrv.getMatters(supplier.id, uuid);
    }
}