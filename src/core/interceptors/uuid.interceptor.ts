import { NestInterceptor, Injectable, ExecutionContext } from "@nestjs/common";
import { Observable } from "rxjs";
import { NestUtil } from "../utils/nest.util";
import * as v4 from "uuid/v4";

@Injectable()
export class UuidInterceptor implements NestInterceptor {

    /**
     * @description Intercept request and add UUID to the request
     * @author Quentin Wolfs
     * @param {ExecutionContext} context
     * @param {Observable<any>} call$
     * @returns {Observable<any>}
     * @memberof UuidInterceptor
     */
    public intercept(context: ExecutionContext, call$: Observable<any>): Observable<any> {
        const request = NestUtil.getRequest(context);
        request["requestUUID"] = v4();

        return call$;
    }
}