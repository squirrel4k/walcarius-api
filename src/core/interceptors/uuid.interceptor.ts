import { NestInterceptor, Injectable, ExecutionContext, CallHandler} from "@nestjs/common";
import { Observable } from "rxjs";
import { NestUtil } from "../utils/nest.util";
import { v4 } from "uuid";

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
    public intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        const request = NestUtil.getRequest(context);
        request["requestUUID"] = v4();

        return next.handle();
    }
}