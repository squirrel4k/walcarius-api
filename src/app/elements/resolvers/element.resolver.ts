import { Resolver, Query, Args, Mutation, ResolveProperty, Parent, Context } from "@nestjs/graphql";
import { Element, InputElement, UpdateElement } from "../interfaces/element.interface";
import { ElementService } from "../services/element.service";
import { ElementGroup } from "../interfaces/element-group.interface";
import { Matter } from "../interfaces/matter.interface";
import { GqlLoggerInterceptor } from "../../common/interceptors/gql-logger.interceptor";
import { BadRequestException, UseInterceptors } from "@nestjs/common";
import { Access } from "../../../core/decorators/access.decorator";
import { GRANT_TOKEN } from "../../common/jwt/jwt.interface";
import { UUID } from "../../../core/decorators/uuid.decorator";
import { ElementGroupService } from "../services/element-group.service";
import { MatterService } from "../services/matter.service";
import { PERMISSION_CATEGORIES } from "../../users/enums/permissioncategories.enum";
import { PERMISSION_TYPES } from "../../users/enums/permissiontypes.enum";
import { ERROR_MESSAGE } from "../../../core/errors/enum/error.enum";
import { LocalStorage } from "node-localstorage";
import { AuthService } from "../../auth/auth.service";
import { Request } from "@nestjs/common/decorators";

@Resolver("Element")
@UseInterceptors(GqlLoggerInterceptor)
export class ElementResolver {

    public constructor (
        private readonly _elementSrv: ElementService,
        private readonly _elementGroupSrv: ElementGroupService,
        private readonly _matterSrv: MatterService,
        private readonly _authSrv : AuthService
    ) { }

    @Query("searchElement")
    @Access(GRANT_TOKEN.FRONT_ACCESS)
    public async searchElement(
        @Args("elementGroupId") elementGroupId: number,
        @Args("matterId") matterId: number,
        @Args("search") search: string
    ): Promise<Element[]> {
        return this._elementSrv.searchElement(search, elementGroupId, matterId);
    }

    @Query("searchPlateThickness")
    @Access(GRANT_TOKEN.FRONT_ACCESS)
    public async searchPlateThickness(@Args("matterId") matterId: number, @Args("search") search: string): Promise<number[]> {
        return this._elementSrv.searchPlateThickness(matterId, search);
    }

    @Mutation("addElement")
    @Access(GRANT_TOKEN.FRONT_ACCESS)
    public async addElement(@Args("element") element: InputElement, @UUID() uuid: string): Promise<Element> {
        return this._elementSrv.createWithNatureValues(element, uuid);
    }

    @Mutation("updateElement")
    @Access(GRANT_TOKEN.FRONT_ACCESS)
    public async updateElement(@Args("id") id: number, @Args("element") element: UpdateElement, @UUID() uuid: string, @Context() ctx: any): Promise<Element> {
        let updatepermisssion = this._authSrv.authorized(ctx.req.user.userGroup,PERMISSION_CATEGORIES.CATALOG,PERMISSION_TYPES.WRITE);
        if(updatepermisssion){
            return this._elementSrv.updateWithNatureValues(id, element, uuid);
        }else{
            throw new BadRequestException(ERROR_MESSAGE.FORBIDDEN);
        }    
    }

    @Mutation("deleteElement")
    @Access(GRANT_TOKEN.FRONT_ACCESS)
    public async deleteElement(@Args("id") id: number, @Context() ctx: any): Promise<boolean> {
         //check permission delete catalog element
         let deletepermisssion = this._authSrv.authorized(ctx.req.user.userGroup,PERMISSION_CATEGORIES.CATALOG,PERMISSION_TYPES.DELETE);
         if(deletepermisssion){
             return this._elementSrv.delete(id);
         }else{
             throw new BadRequestException(ERROR_MESSAGE.FORBIDDEN);
         }
    }

    @ResolveProperty("elementGroup")
    public async getElementGroup(@Parent() element: Element, @UUID() uuid: string): Promise<ElementGroup> {
        return element.elementGroupId ? await this._elementGroupSrv.getById(element.elementGroupId, uuid) : null;
    }

    @ResolveProperty("matter")
    public async getMatter(@Parent() element: Element, @UUID() uuid: string): Promise<Matter> {
        return element.matterId ? await this._matterSrv.getById(element.matterId, uuid) : null;
    }
}