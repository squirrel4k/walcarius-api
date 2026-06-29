import { ValidationError } from "apollo-server-core";
import { HttpStatus, Logger } from "@nestjs/common";
import { EnumUtil } from "../../utils/enum.util";
import { ERROR_MESSAGE } from "../enum/error.enum";
import { ErrorDisplay } from "../config/error-display.config";
import { LANG } from "../../enums/language.enum";
import { TranslationUtil } from "../../../core/utils/translation.util";
import { GraphQLFormattedError } from "graphql";

export interface FormattedError extends GraphQLFormattedError {
    statusCode?: number;
    code?: number;
    infos?: string;
}

export class ErrorFormatterUtil {

    /**
     * @description Format a catched error for return, and logs it if a logger if given
     * @author Quentin Wolfs
     * @static
     * @param {*} err
     * @param {Logger} [logger]
     * @returns {FormattedError}
     * @memberof ErrorFormatterUtil
     */
    public static format(err: any, logger?: Logger): FormattedError {
        let error: any = {
            path: err.path ? err.path : null,
            locations: err.locations ? err.locations : null,
            message: null
        };

        // Generated Nest exception
        if (err.message && err.message.error && typeof err.message.error === "string") {
            error = {
                ...error,
                message: err.message.error,
                statusCode: err.message.statusCode,
                ...this.formatNestInfo(err)
            };
        // Encapsulated Nest exception
        } else if (err.message instanceof Error) {
            error = {
                ...error,
                ...this.formatEncapsulatedNestInfo(err)
            };
        // GraphQL validation error
        } else if (err instanceof ValidationError || err.path === undefined) {
            error = {
                ...error,
                message: "GraphQL validation failed",
                statusCode: 601
            };
        // Uncatched error
        } else if (err.extensions && err.extensions.code == "INTERNAL_SERVER_ERROR") {
            error = {
                ...error,
                message: "Internal Server Error",
                statusCode: 500,
                ...this.displayErrorMessage(ERROR_MESSAGE.INTERNAL_SERVER_ERROR)
            };
            if (logger && err.extensions.exception && !err.extensions.exception.errLogged) {
                // Should happen if error is only seen by GraphQL. Like if the data is marked with ! in .graphql, but is null nonetheless
                const toLog = {
                    message: err.message,
                    path: Array.isArray(err.path) ? err.path.join(", ") : err.path
                };
                let stackTrace: string = null;
                if (err.extensions.exception) {
                    stackTrace = Array.isArray(err.extensions.exception.stacktrace) ?
                        err.extensions.exception.stacktrace.join("\n") : err.extensions.exception.stacktrace;
                }
                logger.error(toLog, stackTrace);
            }
        // Unknown error
        } else {
            error = {
                ...error,
                message: "Unknown Error",
                statusCode: 600,
                ...this.displayErrorMessage(ERROR_MESSAGE.UNKNOWN_ERROR)
            };
            if (logger) { logger.error({ ...err, message: err.message || "No message" }); }
        }

        error.infos = error.infos ? error.infos : this.findOriginMessage(err);
        return error;
    }

    /**
     * @description Recursively searchs for the original message of the error, to a max depth of 10 (by default)
     * @author Quentin Wolfs
     * @private
     * @static
     * @param {*} error
     * @param {number} [maxDeepth=10]
     * @returns {string}
     * @memberof ErrorFormatterUtil
     */
    private static findOriginMessage(error: any, maxDeepth: number = 10): string {
        if (maxDeepth > 0) {
            if (error.message) {
                if (typeof error.message === "string") {
                    return error.message;
                } else {
                    return this.findOriginMessage(error.message, (maxDeepth - 1));
                }
            } else if (error.error) {
                return this.findOriginMessage(error.error, (maxDeepth - 1));
            }
        } else {
            return null;
        }
    }

    /**
     * @description Format Nest Exceptions info for future display
     * @author Quentin Wolfs
     * @private
     * @static
     * @param {*} error
     * @returns {{ infos: string, code?: number }}
     * @memberof GqlErrorService
     */
    private static formatNestInfo(error: any): { infos: string, code?: number } {
        if (error.message.statusCode == HttpStatus.INTERNAL_SERVER_ERROR) {
            return this.displayErrorMessage(ERROR_MESSAGE.INTERNAL_SERVER_ERROR);
        } else {
            return this.displayErrorMessage(EnumUtil.inValues(ERROR_MESSAGE, error.message.message) ?
                error.message.message :
                ERROR_MESSAGE[error.message.error.split(" ").join("_").toUpperCase()]
            );
        }
    }

    /**
     * @description Format Encapsulated nexst Exceptions info for future display
     * @author Quentin Wolfs
     * @private
     * @static
     * @param {*} error
     * @returns {{ infos: string, code?: number }}
     * @memberof GqlErrorService
     */
    private static formatEncapsulatedNestInfo(error: any): { infos: string, code?: number } {
        if (error.extensions && error.extensions.exception && error.extensions.exception.status == HttpStatus.INTERNAL_SERVER_ERROR) {
            return this.displayErrorMessage(ERROR_MESSAGE.INTERNAL_SERVER_ERROR);
        } else {
            return this.displayErrorMessage(ERROR_MESSAGE.UNKNOWN_ERROR);
        }
    }

    /**
     * @description Display the error message
     * @author Quentin Wolfs
     * @private
     * @static
     * @param {ERROR_MESSAGE} message
     * @param {LANG} [lang]
     * @returns {string}
     * @memberof GqlErrorService
     */
    private static displayErrorMessage(message: ERROR_MESSAGE, lang?: LANG): { infos: string, code?: number } {
        const baseDisplay = ErrorDisplay[message] ? ErrorDisplay[message] : ErrorDisplay[ERROR_MESSAGE.UNKNOWN_ERROR];

        return {
            code: baseDisplay.code,
            infos: TranslationUtil.translate(`error_message.${baseDisplay.infoKey}`, lang ? lang : LANG.FR)
        };
    }
}