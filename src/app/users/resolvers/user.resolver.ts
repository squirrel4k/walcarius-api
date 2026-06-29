import { Resolver, Query, Args, Context, Mutation } from "@nestjs/graphql";
import { UserService } from "../services/user.service";
import { UpdateUser, User, UserInput, UserSort } from "../interfaces/user.interface";
import { BadRequestException, UnauthorizedException, UseInterceptors } from "@nestjs/common";
import { GqlLoggerInterceptor } from "../../common/interceptors/gql-logger.interceptor";
import { Access } from "../../../core/decorators/access.decorator";
import { GRANT_TOKEN } from "../../common/jwt/jwt.interface";
import { UUID } from "../../../core/decorators/uuid.decorator";
import { InjectRepository } from "@nestjs/typeorm";
import { UserSql } from "../entities/user.entity";
import { getConnection, Repository } from "typeorm";
import { Pagination } from "../../../core/interfaces/crud.interface";
import { ErrorUtil } from "../../../core/utils/error.util";
import { BcryptUtil } from "../../../core/utils/bcrypt.util";
import { SmtpConfigService } from "../../smtp-config/services/smtp-config.service";
import { SmtpConfigSql } from "../../smtp-config/entities/smtp-config.entity";
import { ERROR_MESSAGE } from "../../../core/errors/enum/error.enum";
import { PERMISSION_CATEGORIES } from "../enums/permissioncategories.enum";
import { PERMISSION_TYPES } from "../enums/permissiontypes.enum";
import { AuthService } from "../../auth/auth.service";

@Resolver("User")
@UseInterceptors(GqlLoggerInterceptor)
export class UserResolver {

    public constructor(
        private readonly _userSrv: UserService,
        private readonly _smtpSrv: SmtpConfigService,
        private readonly _authSrv: AuthService,
        @InjectRepository(UserSql) private readonly _userRepo: Repository<UserSql>,
        @InjectRepository(SmtpConfigSql) private readonly _smtpRepo: Repository<SmtpConfigSql>
    ) { }

    /**
    * @description Get a User from database by its id
    * @author Marie Claudia
    * @param {number} id
    * @param {string} uuid
    * @returns {Promise<User>}
    * @memberof UserResolver
    */
    @Query("getUser")
    @Access(GRANT_TOKEN.FRONT_ACCESS)
    public async getUser(@Args("id") id: number, @UUID() uuid: string): Promise<User> {
        return this._userSrv.getByIdUser(id, uuid);
    }


    /**
    * @description update User from database by its id
    * @author Marie Claudia
    * @param {number} id
    * @param {string} uuid
    * @param {UpdateUser} user
    * @returns {Promise<User>}
    * @memberof UserResolver
    */
    @Mutation("updateUser")
    @Access(GRANT_TOKEN.FRONT_ACCESS)
    public async updateUser(
        @Args("id") id: number,
        @Args("user") user: UpdateUser,
        @UUID() uuid: string,
        @Context() ctx: any
    ): Promise<User> {
        const updatePermisssion = this._authSrv.authorized(ctx.req.user.userGroup, PERMISSION_CATEGORIES.USERS, PERMISSION_TYPES.WRITE);
        if (updatePermisssion) {
            return this._userSrv.updateUser(id, user, uuid);
        } else {
            throw new BadRequestException(ERROR_MESSAGE.FORBIDDEN);
        }
    }

    /**
     * @description get users
     * @author Marie Claudia
     * @param {string} search
     * @param {UserSort} sort
     * @param {Pagination} pagination
     * @param ctx
     * @returns {Promise<User[]>}
     * @memberof UserResolver
     */
    @Query("getUsers")
    @Access(GRANT_TOKEN.FRONT_ACCESS)
    public async getList(
        @Args("search") search: string,
        @Args("sort") sort: UserSort,
        @Args("pagination") pagination: Pagination,
        @Context() ctx: any
    ): Promise<User[]> {
        const results = await this._userSrv.frontList({ search }, sort, pagination);
        ctx.pagination = results.pagination;
         // check permission read list users
        const readPermisssion = this._authSrv.authorized(ctx.req.user.userGroup, PERMISSION_CATEGORIES.USERS, PERMISSION_TYPES.READ);
        if (readPermisssion) {
            return results.data.filter((user: User) => user.deletedAt === null);
        } else {
            throw new BadRequestException(ERROR_MESSAGE.FORBIDDEN);
        }
    }

    /**
    * @description create User
    * @author Marie Claudia
    * @param {UserInput} data
    * @returns {Promise<User[]>}
    * @memberof UserResolver
    */
    @Mutation("createUser")
    @Access(GRANT_TOKEN.FRONT_ACCESS)
    public async create(@Args("data") data: UserInput): Promise<User> {
        return await getConnection().transaction(async transaction => {
            if (data.password) {
                data.password = await BcryptUtil.hash(data.password);
            }
            const user = await this._userSrv.create(data, transaction);

            this._smtpRepo.save({
                loginId: user.id,
                username: null,
                password: null,
                host: null,
                active: false,
                port: 0,
                email: null,
                id: null
            });

            // todo: create stmpconfig
            return user;
        }).catch(err => { throw ErrorUtil.get(err); });
    }

    @Mutation("deleteUser")
    @Access(GRANT_TOKEN.FRONT_ACCESS)
    public async deleteUser(@Args("id") id: number, @Context() ctx: any): Promise<boolean> {
         // check permission delete user
         const deletePermisssion = this._authSrv.authorized(ctx.req.user.userGroup, PERMISSION_CATEGORIES.USERS, PERMISSION_TYPES.DELETE);
         if (deletePermisssion) {
            // return this._userSrv.delete(id);
            return await getConnection().transaction(async manager => {
                return await this._userSrv.delete(id, manager);
            }).catch(err => { throw ErrorUtil.get(err); });
         } else {
            throw new BadRequestException(ERROR_MESSAGE.FORBIDDEN);
         }
    }

}