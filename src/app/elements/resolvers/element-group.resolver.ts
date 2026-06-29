import { Resolver, Query, Args, ResolveProperty, Parent } from "@nestjs/graphql";
import { ElementGroup } from "../interfaces/element-group.interface";
import { ElementGroupService } from "../services/element-group.service";
import { ElementService } from "../services/element.service";
import { Element } from "../interfaces/element.interface";
import { Category } from "../interfaces/category.interface";
import { Matter } from "../interfaces/matter.interface";
import { MatterService } from "../services/matter.service";
import { Nature } from "../interfaces/nature.interface";
import { UseInterceptors } from "@nestjs/common";
import { GqlLoggerInterceptor } from "../../common/interceptors/gql-logger.interceptor";
import { Access } from "../../../core/decorators/access.decorator";
import { GRANT_TOKEN } from "../../common/jwt/jwt.interface";
import { UUID } from "../../../core/decorators/uuid.decorator";
import { CategoryService } from "../services/category.service";
import { NatureService } from "../services/nature.service";

@Resolver("ElementGroup")
@UseInterceptors(GqlLoggerInterceptor)
export class ElementGroupResolver {

    public constructor (
        private readonly _elementGroupSrv: ElementGroupService,
        private readonly _elementSrv: ElementService,
        private readonly _categorySrv: CategoryService,
        private readonly _matterSrv: MatterService,
        private readonly _natureSrv: NatureService
    ) { }

    @Query("getElementGroupById")
    @Access(GRANT_TOKEN.FRONT_ACCESS)
    public async getElementGroupById(@Args("elementGroupId") id: number, @UUID() uuid: string): Promise<ElementGroup> {
        return this._elementGroupSrv.getById(id, uuid);
    }

    @ResolveProperty("elementNatureDefinitions")
    public async getElementNatureDefinitions(@Parent() elementGroup: ElementGroup, @UUID() uuid: string): Promise<Nature[]> {
        return this._natureSrv.getNaturesByElementGroup(elementGroup.id, uuid);
    }

    @ResolveProperty("elements")
    public async getElementsFromGroup(@Parent() elementGroup: ElementGroup, @Args("matterId") matterId: number, @UUID() uuid: string): Promise<Element[]> {
        return !!matterId ?
            this._elementSrv.getByElementGroupAndMatter(elementGroup.id, matterId, uuid) :
            this._elementSrv.getElementByElementGroup(elementGroup.id, uuid);
    }

    @ResolveProperty("category")
    public async getCategory(@Parent() elementGroup: ElementGroup, @UUID() uuid: string): Promise<Category> {
        return elementGroup.categoryId ? await this._categorySrv.getById(elementGroup.categoryId, uuid) : null;
    }

    @ResolveProperty("availableMatters")
    public async getAvailableMatters(@Parent() elementGroup: ElementGroup, @UUID() uuid: string): Promise<Matter[]> {
        return this._matterSrv.getMattersByElementGroup(elementGroup.id, uuid);
    }
}