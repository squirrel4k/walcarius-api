import { Resolver, Args, Query, Mutation } from "@nestjs/graphql";
import { AuthService } from "./auth.service";
import { AuthUser } from "./interfaces/auth.interfaces";
import { UseInterceptors } from "@nestjs/common";
import { GqlLoggerInterceptor } from "../common/interceptors/gql-logger.interceptor";
import { Usr } from "../../core/decorators/user.decorator";
import { Access } from "../../core/decorators/access.decorator";
import { GRANT_TOKEN } from "../common/jwt/jwt.interface";
import { UUID } from "../../core/decorators/uuid.decorator";

@Resolver("Auth")
@UseInterceptors(GqlLoggerInterceptor)
export class AuthResolver {

    public constructor(
        private readonly _authSrv: AuthService
    ) { }

    @Query()
    public async authenticate(@Args("login") login: string, @Args("password") password: string): Promise<AuthUser> {
        return this._authSrv.grantAccessToken(login, password);
    }

    @Query()
    public async sendResetPasswordMail(@Args("email") email: string, @UUID() uuid: string): Promise<Boolean> {
        return this._authSrv.sendResetPasswordMail(email, uuid);
    }

    @Query()
    @Access(GRANT_TOKEN.FRONT_ACCESS)
    public async ping(): Promise<String> {
        return "pong";
    }

    @Mutation()
    @Access(GRANT_TOKEN.SET_PASSWORD)
    public async resetPassword(@Usr() user: AuthUser, @Args("password") password: string, @UUID() uuid: string): Promise<AuthUser> {
        return this._authSrv.resetPassword(user, password, uuid);
    }
}