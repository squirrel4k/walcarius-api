import { ProjectService } from "../services/project.service";
import { Resolver, Query, Args, Mutation, ResolveProperty, Parent, Context } from "@nestjs/graphql";
import { BadRequestException, UseInterceptors } from "@nestjs/common";
import { GqlLoggerInterceptor } from "../../common/interceptors/gql-logger.interceptor";
import { Access } from "../../../core/decorators/access.decorator";
import { GRANT_TOKEN } from "../../common/jwt/jwt.interface";
import { Project, ProjectInput, ProjectUpdate } from "../interfaces/project.interface";
import { UUID } from "../../../core/decorators/uuid.decorator";
import { SupplyList } from "../interfaces/supply-list.interface";
import { SupplyListService } from "../services/supply-list.service";
import { getConnection } from "typeorm";
import { PurchaseOrder } from "../../purchase-orders/interfaces/purchase-order.interface";
import { PurchaseOrderService } from "../../purchase-orders/services/purchase-order.service";
import { ErrorUtil } from "../../../core/utils/error.util";
import { PriceRequestAssignationManager } from "../../price-requests/managers/price-request-assignation.manager";
import { Pagination } from "../../../core/interfaces/crud.interface";
import { ERROR_MESSAGE } from "../../../core/errors/enum/error.enum";
import { PERMISSION_CATEGORIES } from "../../users/enums/permissioncategories.enum";
import { PERMISSION_TYPES } from "../../users/enums/permissiontypes.enum";
import { AuthService } from "../../auth/auth.service";

@Resolver("Project")
@UseInterceptors(GqlLoggerInterceptor)
export class ProjectResolver {

    public constructor (
        private readonly _projectSrv: ProjectService,
        private readonly _supplyListSrv: SupplyListService,
        private readonly _purchaseOrderSrv: PurchaseOrderService,
        private readonly _priceRequestAssignationMgr: PriceRequestAssignationManager,
        private readonly _authSrv : AuthService
    ) { }

    @Query("projectsByReference")
    @Access(GRANT_TOKEN.FRONT_ACCESS)
    public async getProjectsByreference(@Args("reference") reference: string): Promise<Project> {
        try {
            const result = await this._projectSrv.findByProperty({ reference: reference })
            return result;
        } catch (error) {
            throw ErrorUtil.get(error);
        }
       
    }
    @Query("projects")
    @Access(GRANT_TOKEN.FRONT_ACCESS)
    public async getProjects(@Args("search") search: string, @Args("pagination") pagination: Pagination, @Context() ctx: any): Promise<Project[]> {
        const result = await this._projectSrv.frontList({ search }, null, pagination);
        ctx.pagination = result.pagination;
                //check permission read list Projects
        let readpermisssion = this._authSrv.authorized(ctx.req.user.userGroup,PERMISSION_CATEGORIES.PROJECTS,PERMISSION_TYPES.READ);
        if(readpermisssion){
            return result.data;
        }else{
            throw new BadRequestException(ERROR_MESSAGE.FORBIDDEN);
        }
        
    }

    @Query("project")
    @Access(GRANT_TOKEN.FRONT_ACCESS)
    public async getProject(@Args("id") id: number, @UUID() uuid: string): Promise<Project> {
        return await this._projectSrv.getById(id, uuid);
    }

    @Mutation("createProject")
    @Access(GRANT_TOKEN.FRONT_ACCESS)
    public async create(@Args("data") data: ProjectInput): Promise<Project> {
        return await getConnection().transaction(async transaction => {
            const project = await this._projectSrv.create(data, transaction);
            if (data.supplyLists && Array.isArray(data.supplyLists) && data.supplyLists.length > 0) {
                project.supplyLists = [await this._supplyListSrv.createOne(data.supplyLists.shift(), project.id, transaction)];
            }

            return project;
        }).catch(err => { throw ErrorUtil.get(err); });
    }

    @Mutation("deleteProject")
    @Access(GRANT_TOKEN.FRONT_ACCESS)
    public async delete(@Args("id") id: number, @UUID() uuid: string, @Context() ctx: any): Promise<boolean> {
        const supplyLists = await this._supplyListSrv.getSupplyListsByProject(id, uuid);

        //check permission delete Project
        let deletepermisssion = this._authSrv.authorized(ctx.req.user.userGroup,PERMISSION_CATEGORIES.PROJECTS,PERMISSION_TYPES.DELETE);

        if(deletepermisssion){
            return await getConnection().transaction(async transaction => {
                for (const supplyList of supplyLists) {
                    if (!!supplyList.priceRequestId) {
                        await this._priceRequestAssignationMgr.freeSupplyList(supplyList, transaction);
                    }
                    await this._supplyListSrv.delete(supplyList.id, transaction);
                }
                return await this._projectSrv.delete(id, transaction);
            }).catch(err => { throw ErrorUtil.get(err); });
        }else{
            throw new BadRequestException(ERROR_MESSAGE.FORBIDDEN);
        }
    }

    @Mutation("updateProject")
    @Access(GRANT_TOKEN.FRONT_ACCESS)
    public async update(@Args("id") id: number, @Args("data") data: ProjectUpdate, @UUID() uuid: string, @Context() ctx: any): Promise<Project> {
        //check permission delete project
        let updatepermisssion = this._authSrv.authorized(ctx.req.user.userGroup,PERMISSION_CATEGORIES.PROJECTS,PERMISSION_TYPES.WRITE);
        if(updatepermisssion){
            return await this._projectSrv.update(id, data, uuid);
        }else{
            throw new BadRequestException(ERROR_MESSAGE.FORBIDDEN);
        } 
    }

    @ResolveProperty("supplyLists")
    public async getLinkedSupplyLists(@Parent() project: Project, @UUID() uuid: string): Promise<SupplyList[]> {
        return await this._supplyListSrv.getSupplyListsByProject(project.id, uuid);
    }

    @ResolveProperty("purchaseOrders")
    public async getPurchaseOrders(@Parent() project: Project, @UUID() uuid: string): Promise<PurchaseOrder[]> {
        return await this._purchaseOrderSrv.loadByProject(project.id, uuid);
    }

    @ResolveProperty("totalSupplyListQty")
    public async getTotalSupplyListQuantity(@Parent() project: Project, @UUID() uuid: string): Promise<number> {
        return await this._projectSrv.getTotalSupplyListQuantity(project.id, uuid);
    }

    @ResolveProperty("unusedSupplyListQty")
    public async getUnusedSupplyListQuantity(@Parent() project: Project, @UUID() uuid: string): Promise<number> {
        return await this._projectSrv.getUnusedSupplyListQuantity(project.id, uuid);
    }
}