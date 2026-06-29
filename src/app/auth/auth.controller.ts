import { Controller, Post, Body, UsePipes, ValidationPipe, UseInterceptors, Request, HttpCode } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { RequireTokenDto } from "./dto/auth.dto";
import { AuthUser } from "./interfaces/auth.interfaces";
import { RestLoggerInterceptor } from "../common/interceptors/rest-logger.interceptor";

@Controller()
@UseInterceptors(RestLoggerInterceptor)
export class AuthController {

    public constructor(
        private readonly _authSrv: AuthService
    ) { }

    @Post("login")
    @UsePipes(ValidationPipe)
    @HttpCode(200)
    public async getToken(@Body() dto: RequireTokenDto, @Request() req: any): Promise<{ data: AuthUser }> {
        const auth = await this._authSrv.grantAccessToken(dto.email, dto.password);
        req.res.set("Authorization", `Bearer ${auth.token}`);

        return { data : auth };
    }
}