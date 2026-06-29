import { JwtService } from "@nestjs/jwt";
import * as jwt from "jsonwebtoken";
import { Injectable } from "@nestjs/common";
import { JwtAccessPayload, JwtPasswordPayload, GRANT_TOKEN, JwtUserPayload } from "./jwt.interface";

/**
 * @description Wrapper class that enable the JWT module to be initialized at once and available all across the app
 * @author Quentin Wolfs
 * @export
 * @class JwtWrapperService
 */
@Injectable()
export class JwtWrapperService {

    public constructor(
        private readonly _jwtSrv: JwtService
    ) { }

    public sign(payload: string | Object | Buffer, options?: jwt.SignOptions): string {
        return this._jwtSrv.sign(payload, options);
    }

    public async signAsync(payload: string | Object | Buffer, options?: jwt.SignOptions): Promise<string> {
        return this._jwtSrv.signAsync(payload, options);
    }

    public verify<T extends object = any>(token: string, options?: jwt.VerifyOptions): T {
        return this._jwtSrv.verify(token, options);
    }

    public async verifyAsync<T extends object = any>(token: string, options?: jwt.VerifyOptions): Promise<T> {
        return this._jwtSrv.verifyAsync(token, options);
    }

    public decode(token: string, options?: jwt.DecodeOptions): null | { [key: string]: any } | string {
        return this._jwtSrv.decode(token, options);
    }

    /**
     * @description Generates a JWT token usable to set/reset a password
     * @author Quentin Wolfs
     * @param {User} user
     * @returns {Promise<string>}
     * @memberof AuthService
     */
    public async genPasswordToken(payload: JwtPasswordPayload, isReset: boolean = false): Promise<string> {
        const realPayload: JwtAccessPayload = {
            ...payload,
            grant: GRANT_TOKEN.SET_PASSWORD
        };
        const options: jwt.SignOptions = { expiresIn: isReset ? process.env.WAL_RESET_PWD_EXPIRE : process.env.WAL_SET_PWD_EXPIRE };

        return this.signAsync(realPayload, options);
    }

    /**
     * @description Generates a JWT token usable to access the application
     * @author Quentin Wolfs
     * @param {JwtUserPayload} payload
     * @param {boolean} [isExternal=false]
     * @returns {Promise<string>}
     * @memberof JwtWrapperService
     */
    public async genAccessToken(payload: JwtUserPayload): Promise<string> {
        const realPayload: JwtAccessPayload = {
            ...payload,
            grant: GRANT_TOKEN.FRONT_ACCESS
        };
        const options: jwt.SignOptions = { expiresIn: process.env.WAL_AUTH_EXPIRE };

        return this.signAsync(realPayload, options);
    }
}