import { GqlContext } from "../../../core/interfaces/gql-context.interface";
import { Resolver, Query, Args, ResolveField, Parent, Mutation, Context } from "@nestjs/graphql";
import { SupplyListService } from "../services/supply-list.service";
import { Access } from "../../../core/decorators/access.decorator";
import { GRANT_TOKEN } from "../../common/jwt/jwt.interface";
import { UseInterceptors, BadRequestException } from "@nestjs/common";
import { GqlLoggerInterceptor } from "../../common/interceptors/gql-logger.interceptor";
import { SupplyList, SupplyListInput, SupplyListUpdate, SupplyListFilter, SupplyListSort } from "../interfaces/supply-list.interface";
import { ProjectService } from "../services/project.service";
import { UUID } from "../../../core/decorators/uuid.decorator";
import { Project } from "../interfaces/project.interface";
import { SupplyListElementService } from "../services/supply-list-element.service";
import { SupplyListElement } from "../interfaces/supply-list-element.interface";
import { PriceRequestService } from "../../price-requests/services/price-request.service";
import { PriceRequest } from "../../price-requests/interfaces/price-request.interface";
import { SupplyCategory } from "../../suppliers/interfaces/supply-category.interface";
import { SupplyCategoryService } from "../../suppliers/services/supply-category.service";
import { DataSource } from "typeorm";
import { ERROR_MESSAGE } from "../../../core/errors/enum/error.enum";
import { ErrorUtil } from "../../../core/utils/error.util";
import { PERMISSION_CATEGORIES } from "../../users/enums/permissioncategories.enum";
import { PERMISSION_TYPES } from "../../users/enums/permissiontypes.enum";
import { AuthService } from "../../auth/auth.service";
import { PriceRequestAssignationManager } from "../../price-requests/managers/price-request-assignation.manager";

@Resolver("SupplyList")
@UseInterceptors(GqlLoggerInterceptor)
export class SupplyListResolver {

    constructor(
        private readonly _dataSource: DataSource,
        private readonly _supplyListSrv: SupplyListService,
        private readonly _projectSrv: ProjectService,
        private readonly _supplyListElementSrv: SupplyListElementService,
        private readonly _priceRequestSrv: PriceRequestService,
        private readonly _supplyCategorySrv: SupplyCategoryService,
        private readonly _authSrv : AuthService,
        private readonly _priceRequestAssignationMng: PriceRequestAssignationManager
    ) {}

    @Query("supplyLists")
    @Access(GRANT_TOKEN.FRONT_ACCESS)
    public async getList(@Args("filter") filter: SupplyListFilter, @Args("sort") sort: SupplyListSort): Promise<SupplyList[]> {
        return await this._supplyListSrv.list(filter, sort);
    }

    @Query("supplyList")
    @Access(GRANT_TOKEN.FRONT_ACCESS)
    public async getById(@Args("id") id: number, @UUID() uuid: string): Promise<SupplyList> {
        return await this._supplyListSrv.getById(id, uuid);
    }

    @Query("canDissociateFromPriceRequest")
    @Access(GRANT_TOKEN.FRONT_ACCESS)
    public async canDissociate(@Args("id") id: number, @UUID() uuid: string): Promise<boolean> {
        const supplyList: SupplyList = await this._supplyListSrv.getById(id, uuid);

        try {
            return await this._supplyListSrv.isSupplyListFreeable(supplyList);
        } catch (e) {
            return false;
        }
    }

    @Mutation("deleteSupplyList")
    @Access(GRANT_TOKEN.FRONT_ACCESS)
    public async delete(@Args("id") id: number, @Context() ctx: GqlContext): Promise<boolean> {
        let deletepermisssion = this._authSrv.authorized(ctx.req.user.userGroup,PERMISSION_CATEGORIES.PROJECTS,PERMISSION_TYPES.DELETE);
        if(deletepermisssion){
            return await this._dataSource.transaction(async transaction => {
                return this._supplyListSrv.delete(id, transaction);
            }).catch(err => { throw ErrorUtil.get(err); });
        }else{
            throw new BadRequestException(ERROR_MESSAGE.FORBIDDEN);
        }
    }

    @Mutation("deleteSupplyLists")
    @Access(GRANT_TOKEN.FRONT_ACCESS)
    public async deleteByIds(@Args("ids") ids: number[], @Context() ctx: GqlContext): Promise<boolean> {
        let deletepermisssion = this._authSrv.authorized(ctx.req.user.userGroup,PERMISSION_CATEGORIES.PROJECTS,PERMISSION_TYPES.DELETE);
        if(deletepermisssion){
            return await this._dataSource.transaction(async transaction => {
                return this._supplyListSrv.deleteByIds(ids, transaction);
            }).catch(err => { throw ErrorUtil.get(err); });
        }else{
            throw new BadRequestException(ERROR_MESSAGE.FORBIDDEN);
        }
    }

    @Mutation("createSupplyList")
    @Access(GRANT_TOKEN.FRONT_ACCESS)
    public async create(@Args("data") data: SupplyListInput, @Args("projectId") projectId: number): Promise<SupplyList> {
        return await this._dataSource.transaction(async transaction => {
            return await this._supplyListSrv.createOne(data, projectId, transaction);
        }).catch(err => { throw ErrorUtil.get(err); });
    }

    @Mutation("updateSupplyList")
    @Access(GRANT_TOKEN.FRONT_ACCESS)
    public async update(@Args("id") id: number, @Args("data") data: SupplyListUpdate, @Context() ctx: GqlContext): Promise<SupplyList> {
        if (!(await this._supplyListSrv.isSupplyListEditable(id))) {
            throw new BadRequestException(ERROR_MESSAGE.SUPPLY_LIST_ALREADY_ASSIGNED);
        }

        const updatePermisssion = this._authSrv.authorized(ctx.req.user.userGroup, PERMISSION_CATEGORIES.PROJECTS, PERMISSION_TYPES.WRITE);
        if (updatePermisssion) {
            return await this._dataSource.transaction(async transaction => {
                const supplyList = await this._supplyListSrv.getById(id, ctx.req.requestUUID)
                // Update elements (elements are always updated at the same time)
                await this._supplyListElementSrv.updateMultiple(id, data.elements, transaction);
                const updatedSupplyList = await this._supplyListSrv.update(id, data, transaction);
                if(supplyList.priceRequestId){
                    const supplyLists = await this._supplyListSrv.getSupplyListsByPriceRequest(supplyList.priceRequestId, ctx.req.requestUUID)
                    await this._priceRequestAssignationMng.regeneratePriceRequestElements(supplyList.priceRequestId, supplyLists.map(sl => sl.id),  transaction, ctx.req.requestUUID)
                }
                return updatedSupplyList;
            }).catch(err => { throw ErrorUtil.get(err); });
        } else {
            throw new BadRequestException(ERROR_MESSAGE.FORBIDDEN);
        }

    }

    @ResolveField("project")
    public async getProject(@Parent() supplyList: SupplyList, @UUID() uuid: string): Promise<Project> {
        return await this._projectSrv.getById(supplyList.projectId, uuid);
    }

    @ResolveField("elements")
    public async getSupplyListElements(@Parent() supplyList: SupplyList, @UUID() uuid: string): Promise<SupplyListElement[]> {
        return this._supplyListElementSrv.getSupplyListElementsBySupplyList(supplyList.id, uuid);
    }

    @ResolveField("priceRequest")
    public async getPriceRequest(@Parent() supplyList: SupplyList, @UUID() uuid: string): Promise<PriceRequest> {
        return supplyList.priceRequestId ? this._priceRequestSrv.getById(supplyList.priceRequestId, uuid) : null;
    }

    @ResolveField("parentSupplyCategories")
    public async getParentSupplyCategories(@Parent() supplyList: SupplyList, @UUID() uuid: string): Promise<SupplyCategory[]> {
        return this._supplyCategorySrv.getParentBySupplyList(supplyList.id, uuid);
    }

    @ResolveField("infos")
    public async getInfos(@Parent() supplyList: SupplyList, @UUID() uuid: string): Promise<any> {
        return this._supplyListSrv.getInfos(supplyList.id, uuid);
    }
}