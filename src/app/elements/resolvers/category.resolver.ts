import { GqlContext } from "../../../core/interfaces/gql-context.interface";
import { Resolver, Args, ResolveField, Parent, Query, Context } from "@nestjs/graphql";
import { Category } from "../interfaces/category.interface";
import { CategoryService } from "../services/category.service";
import { ElementGroup } from "../interfaces/element-group.interface";
import { ElementGroupService } from "../services/element-group.service";
import { BadRequestException, UseInterceptors } from "@nestjs/common";
import { GqlLoggerInterceptor } from "../../common/interceptors/gql-logger.interceptor";
import { Access } from "../../../core/decorators/access.decorator";
import { GRANT_TOKEN } from "../../common/jwt/jwt.interface";
import { UUID } from "../../../core/decorators/uuid.decorator";
import { ERROR_MESSAGE } from "../../../core/errors/enum/error.enum";
import { PERMISSION_CATEGORIES } from "../../users/enums/permissioncategories.enum";
import { PERMISSION_TYPES } from "../../users/enums/permissiontypes.enum";
import { AuthService } from "../../auth/auth.service";

@Resolver("Category")
@UseInterceptors(GqlLoggerInterceptor)
export class CategoryResolver {

    public constructor (
        private readonly _categorySrv: CategoryService,
        private readonly _elementGroupSrv: ElementGroupService,
        private readonly _authSrv : AuthService
    ) { }

    @Query("category")
    @Access(GRANT_TOKEN.FRONT_ACCESS)
    public async getCategory(@Args("id") id: number, @UUID() uuid: string): Promise<Category> {
        return await this._categorySrv.getById(id, uuid);
    }

    @Query("categories")
    @Access(GRANT_TOKEN.FRONT_ACCESS)
    public async listCategories(@Args("parentCategoryId") parentCategoryId: number, @Context() ctx: GqlContext): Promise<Category[]> {
        //check permission read list catalog
        let readpermisssion = this._authSrv.authorized(ctx.req.user.userGroup,PERMISSION_CATEGORIES.CATALOG,PERMISSION_TYPES.READ);
        if(readpermisssion){
            return await this._categorySrv.categoryList(parentCategoryId);
        }else{
            throw new BadRequestException(ERROR_MESSAGE.FORBIDDEN);
        }
    }

    @ResolveField("childrenCategories")
    public async getChildrenCategories(@Parent() category: Category, @UUID() uuid: string): Promise<Category[]> {
        return this._categorySrv.getChildrenCategories(category.id, uuid);
    }

    @ResolveField("parentCategory")
    public async getParentCategory(@Parent() category: Category, @UUID() uuid: string): Promise<Category> {
        return category.parentCategory ?
            category.parentCategory :
            (category.parentCategoryId ? await this._categorySrv.getById(category.parentCategoryId, uuid) : null);
    }

    @ResolveField("childrenElementGroups")
    public async getChildrenElementGroups(@Parent() category: Category, @UUID() uuid: string): Promise<ElementGroup[]> {
        return this._elementGroupSrv.getElementGroupByCategory(category.id, uuid);
    }
}