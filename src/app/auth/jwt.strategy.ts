import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { AuthService } from "./auth.service";
import { AuthUser } from "./interfaces/auth.interfaces";
import { JwtUserPayload, JwtAccessPayload } from "../common/jwt/jwt.interface";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, "jwt") {

    public constructor(
        private readonly _authSrv: AuthService
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKey: process.env.WAL_AUTH_SECRET_KEY
        });
    }

    /**
     * @description Validates if the user from the JWT payload exists within the database
     * @author Quentin Wolfs
     * @param {JwtPayload} payload
     * @returns
     * @memberof JwtStrategy
     */
    public async validate(payload: JwtUserPayload & JwtAccessPayload) {
        const user: AuthUser = await this._authSrv.validateUser(payload);
        if (!user) { throw new UnauthorizedException(); }
        if (payload.uuid) { user.uuid = payload.uuid; }
        user.grant = payload.grant;
        delete user.password;

        return user;
    }
}