import { NestInterceptor, Injectable, ExecutionContext } from "@nestjs/common";
import { Observable } from "rxjs";
import { NestUtil } from "../utils/nest.util";
import { map } from "rxjs/operators";
import { JwtUtil } from "../utils/jwt.util";
import { Reflector } from "@nestjs/core";
import { GRANT_TOKEN } from "../../app/common/jwt/jwt.interface";

@Injectable()
export class JwtInterceptor implements NestInterceptor {

    public constructor(
        private readonly _reflector: Reflector
    ) { }

    /**
     * @description Intercept request and refresh the Authorization token if necessary
     * @author Quentin Wolfs
     * @param {ExecutionContext} context
     * @param {Observable<any>} call$
     * @returns {Observable<any>}
     * @memberof JwtInterceptor
     */
    public intercept(context: ExecutionContext, call$: Observable<any>): Observable<any> {
        // Verifies if a token is required to be returned for this resolver / route
        const validAccesses: string[] = this._reflector.get<string[]>("access", context.getHandler());
        if (!this.needTokenRefresh(validAccesses)) { return call$; }

        // Get token from authorization header
        const request = NestUtil.getRequest(context);
        const authHeader = request.headers["authorization"];
        const token = authHeader && authHeader.indexOf(" ") !== -1 ? authHeader.split(" ")[1] : null;

        return call$.pipe(
            map(async (result) => {
                // Replace used token by a new fresh token
                if (token) {
                    const response = NestUtil.getResponse(context);
                    response.set("Authorization", `Bearer ${await JwtUtil.refreshToken(token, process.env.WAL_AUTH_SECRET_KEY, process.env.WAL_AUTH_EXPIRE)}`);
                }
                return result;
            })
        );
    }

    /**
     * @description Check if token need refresh based on token type required
     * @author Quentin Wolfs
     * @private
     * @param {string[]} accesses
     * @returns {boolean}
     * @memberof JwtInterceptor
     */
    private needTokenRefresh(accesses: string[]): boolean {
        return accesses && accesses.indexOf(GRANT_TOKEN.FRONT_ACCESS) > -1;
    }
}