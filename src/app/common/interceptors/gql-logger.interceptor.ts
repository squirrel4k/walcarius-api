import { Injectable, ExecutionContext, HttpException, InternalServerErrorException, HttpCode, HttpStatus } from "@nestjs/common";
import { WinstonLogger } from "../logger/winston.logger";
import { Observable, of } from "rxjs";
import { map, catchError } from "rxjs/operators";
import { GqlExecutionContext, GqlArgumentsHost } from "@nestjs/graphql";
import { EnumUtil } from "../../../core/utils/enum.util";
import { ERROR_MESSAGE } from "../../../core/errors/enum/error.enum";

@Injectable()
export class GqlLoggerInterceptor {

    public constructor (
        private readonly _logger: WinstonLogger
    ) { }

    public intercept(context: ExecutionContext, call$: Observable<any>): Observable<any> {
        const ctx = GqlExecutionContext.create(context);
        const request = ctx.getContext().req;
        const info = ctx.getInfo();
        const method: string = info.operation && info.operation.operation ? info.operation.operation.toUpperCase() : "POST";

        const now: number = Date.now();
        return call$.pipe(
            catchError(error => of(error)),
            map(async (result) => {
                // If uncatched error, label it as an InternalServerErrorException
                const isError: boolean = result instanceof Error && !(result instanceof HttpException);
                if (isError) {
                    this.logError(result, ctx, method);
                }
                // Process properly thrown Exceptions
                const isException: boolean = result instanceof HttpException;
                if (isException) {
                    this.logException(result, ctx, method);
                }

                // If not the first part of the GQL query, no need to log the used route
                const hasPrevious = info.path && info.path.prev != null;
                if (hasPrevious) { return result; }

                // Find status
                const response = ctx.getContext().res;
                const status = isError ?
                    HttpStatus.INTERNAL_SERVER_ERROR :
                    (isException ? result.status : response.statusCode);

                // Log resulting answer
                this._logger.logRoute(method, `/gql/${info.fieldName}`, status, Date.now() - now, request.user ? request.user.username : null, request.user ? request.user.id : null);

                // Flags if error as already been logged here.
                if (isError || isException) { result.errLogged = true; }
                return result;
            })
        );
    }

    /**
     * @description Properly logs uncatched Exceptions
     * @author Quentin Wolfs
     * @private
     * @param {Error} error
     * @param {GqlArgumentsHost} ctx
     * @param {string} method
     * @memberof GqlLoggerInterceptor
     */
    private logError(error: Error, ctx: GqlArgumentsHost, method: string) {
        const toLog = {
            message: error.message,
            path: ctx.getInfo().fieldName,
            method: method,
            args: ctx.getArgs()
        };

        this._logger.error(toLog, error.stack);
    }

    /**
     * @description Properly logs HttpExceptions
     * @author Quentin Wolfs
     * @private
     * @param {HttpException} exception
     * @param {GqlArgumentsHost} ctx
     * @param {string} method
     * @memberof GqlLoggerInterceptor
     */
    private logException(exception: HttpException, ctx: GqlArgumentsHost, method: string) {
        const message = (exception.message as any) && (exception.message as any).message ?
            EnumUtil.getKey(ERROR_MESSAGE, (exception.message as any).message) || (exception.message as any).message
            : exception.message;

        if (message instanceof Error) {
            this.logError(message, ctx, method);
        } else {
            const toLog = {
                ...(typeof message === "string" ? { message } : message),
                path: ctx.getInfo().fieldName,
                method: method,
                args: this.obfuscateLogin(ctx.getArgs(), exception)
            };

            exception instanceof InternalServerErrorException ?
                this._logger.error(toLog, exception.stack) :
                this._logger.warn(toLog);
        }
    }

    /**
     * @description Masks password from login attemps so it's not clearly written in logs
     * @author Quentin Wolfs
     * @private
     * @param {*} args
     * @param {*} message
     * @returns {*}
     * @memberof GqlLoggerInterceptor
     */
    private obfuscateLogin(args: any, exception: HttpException): any {
        if (!args) { return args; }
        if (exception.getStatus() == HttpStatus.UNAUTHORIZED) {
            delete args.password;
        }
        return args;
    }
}