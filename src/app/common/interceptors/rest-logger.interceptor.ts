import { Injectable, ExecutionContext, HttpException, HttpStatus, InternalServerErrorException } from "@nestjs/common";
import { WinstonLogger } from "../logger/winston.logger";
import { Observable, of } from "rxjs";
import { map, catchError } from "rxjs/operators";
import { EnumUtil } from "../../../core/utils/enum.util";
import { ERROR_MESSAGE } from "../../../core/errors/enum/error.enum";
import { Request } from "express";

@Injectable()
export class RestLoggerInterceptor {

    public constructor (
        private readonly _logger: WinstonLogger
    ) { }

    public intercept(context: ExecutionContext, call$: Observable<any>): Observable<any> {
        const ctx = context.switchToHttp();
        const request = ctx.getRequest();
        const now: number = Date.now();
        return call$.pipe(
            catchError(error => of(error)),
            map(async (result) => {
                // If uncatched error, label it as an InternalServerErrorException
                const isError: boolean = result instanceof Error && !(result instanceof HttpException);
                if (isError) {
                    this.logError(result, request);
                }
                // Process properly thrown Exceptions
                const isException: boolean = result instanceof HttpException;
                if (isException) {
                    this.logException(result, request);
                }

                if (isError || isException) {
                    this._logger.logRoute(request.method, request.path, result.status || HttpStatus.INTERNAL_SERVER_ERROR, Date.now() - now, request.user ? request.user.username : null, request.user ? request.user.id : null);
                    // Throw error again after log ton maintain HTTP status & exception filters
                    throw result;
                }

                // Log resulting answer
                const response = ctx.getResponse();
                this._logger.logRoute(request.method, request.path, isError ? result.status : response.statusCode, Date.now() - now, request.user ? request.user.login : null);
                return result;
            })
        );
    }

    /**
     * @description Properly logs uncatched Exceptions
     * @author Quentin Wolfs
     * @private
     * @param {Error} error
     * @param {Request} request
     * @memberof RestLoggerInterceptor
     */
    private logError(error: Error, request: Request) {
        const toLog: any = {
            message: error.message,
            path: request.path,
            method: request.method
        };
        if (Object.keys(request.query).length > 0) { toLog.query = request.query; }
        if (Object.keys(request.body).length > 0) { toLog.body = request.body; }

        this._logger.error(toLog, error.stack);
    }

    /**
     * @description Properly logs HttpExceptions
     * @author Quentin Wolfs
     * @private
     * @param {HttpException} exception
     * @param {Request} request
     * @memberof RestLoggerInterceptor
     */
    private logException(exception: HttpException, request: Request) {
        const message = (exception.message as any) && (exception.message as any).message ?
            EnumUtil.getKey(ERROR_MESSAGE, (exception.message as any).message) || (exception.message as any).message
            : exception.message;

        if (message instanceof Error) {
            this.logError(message, request);
        } else {
            const toLog: any = {
                ...(typeof message === "string" ? { message } : message),
                path: request.path,
                method: request.method
            };
            if (Object.keys(request.query).length > 0) { toLog.query = request.query; }
            if (Object.keys(request.body).length > 0) { toLog.body = this.obfuscateLogin(request.body, exception); }

            exception instanceof InternalServerErrorException ?
                this._logger.error(toLog, exception.stack) :
                this._logger.warn(toLog);
        }
    }

    /**
     * @description Masks password from login attemps so it's not clearly written in logs
     * @author Quentin Wolfs
     * @private
     * @param {*} body
     * @param {HttpException} exception
     * @returns {*}
     * @memberof RestLoggerInterceptor
     */
    private obfuscateLogin(body: any, exception: HttpException): any {
        if (!body) { return body; }
        if (exception.getStatus() == HttpStatus.UNAUTHORIZED) {
            delete body.password;
        }
        return body;
    }
}