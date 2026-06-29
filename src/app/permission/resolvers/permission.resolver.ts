import { Resolver, Query, Args, Mutation } from "@nestjs/graphql";
import { UseInterceptors } from "@nestjs/common";
import { GqlLoggerInterceptor } from "../../common/interceptors/gql-logger.interceptor";
import { Access } from "../../../core/decorators/access.decorator";
import { GRANT_TOKEN } from "../../common/jwt/jwt.interface";
import { IPermission, UpdatePermission } from "../interfaces/permission.interface";
import { PermissionService } from "../services/permission.service";


@Resolver("Permission")
@UseInterceptors(GqlLoggerInterceptor)
export class PermissionResolver {

    public constructor(
        private readonly _permissionSrv: PermissionService
    ) { }

    /**
    * @description get Permission where userGroup = userGroup 
    * @author Marie Claudia
    * @param {string} userGroup
    * @returns {Promise<IPermission[]>}
    * @memberof PermissionResolver
    */

    @Query("getPermission")
    @Access(GRANT_TOKEN.FRONT_ACCESS)
    public async getPermission(@Args("userGroup") userGroup: string): Promise<IPermission[]> {
        return await this._permissionSrv.findByProperty({userGroup : userGroup});
    }


    /**
    * @description get Permission where userGroup = userGroup  et category = category
    * @author Marie Claudia
    * @param {string} userGroup
    * @param {string} category
    * @returns {Promise<IPermission[]>}
    * @memberof PermissionResolver
    */
    @Query("getOnePermission")
    @Access(GRANT_TOKEN.FRONT_ACCESS)
    public async getOnePermission(@Args("userGroup") userGroup: string, @Args("category") category: string): Promise<IPermission[]> {
        return await this._permissionSrv.findByProperty({userGroup : userGroup,category : category});
    }

    /**
    * @description update Permission from database by its id
    * @author Marie Claudia
    * @param {number} id
    * @param {UpdatePermission} smtp
    * @returns {Promise<IPermission>}
    * @memberof PermissionResolver
    */
    @Mutation("updatePermission")
    @Access(GRANT_TOKEN.FRONT_ACCESS)
    public async updatePermission(@Args("permission") permission: UpdatePermission, @Args("id") id: number
    ): Promise<IPermission> {  
        return await this._permissionSrv.updatePermission(permission,id);
    }
  
}