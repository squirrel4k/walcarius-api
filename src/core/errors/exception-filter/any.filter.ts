import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from "@nestjs/common";
import { IncomingMessage } from "http";
import { ErrorFormatterUtil } from "../utils/error-formatter.util";
import { WinstonLogger } from "../../../app/common/logger/winston.logger";

/** Catch all Exceptions and format them
 * @description
 * @author Quentin Wolfs
 * @export
 * @class AnyExceptionFilter
 * @implements {ExceptionFilter}
 */
@Catch()
export class AnyExceptionFilter implements ExceptionFilter {

    public constructor(
        private readonly _logger: WinstonLogger
    ) { }

    /**
     * @description
     * @author Quentin Wolfs
     * @param {*} exception
     * @param {ArgumentsHost} host
     * @returns
     * @memberof AnyExceptionFilter
     */
    public catch(exception: any, host: ArgumentsHost) {
        const context = host.switchToHttp();
        const request = context.getRequest();

        if (!(request instanceof IncomingMessage)) {
            // That means it's a GraphQL request, and error handling is done in GqlErrorService, only need to return it
            return exception;
        }

        const response = context.getResponse();
        const status = exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
        const content = ErrorFormatterUtil.format(exception as any, this._logger);

        response
            .status(status)
            .json({
                path: request.url,
                statusCode: content.statusCode,
                code: content.code,
                infos: content.infos
            });
    }

}
