import * as winston from "winston";
import * as DailyRotateFile from "winston-daily-rotate-file";
import { Logger, Injectable } from "@nestjs/common";
import { LoggerOptions } from "./logger.interface";
import { GraphQLError } from "graphql";
import { join } from "path";
import { ErrorLogDto } from "../dto/error.dto";

const defaultTrace: string = "Trace not provided !";

@Injectable()
export class WinstonLogger extends Logger {

    private readonly _logger: winston.Logger;
    private readonly _routeLogLevel: string;
    private _id: string;

    constructor(context?: string) {
        super(context);
        const { options, routeLogLevel } = this.initializeOptions();
        this._logger = winston.createLogger(options);
        this._routeLogLevel = routeLogLevel;
        this._id = process.env.NODE_APP_INSTANCE ? process.env.NODE_APP_INSTANCE : "0";
    }

    private get id(): string {
        return this._id ? this._id : "N/A";
    }

    public log(message: string) {
        this._logger.info(message, {
            timestamp: this.formatDate(new Date()),
            instance: this.id
        });
        if (process.env.WAL_DEBUG && process.env.WAL_DEBUG == "true") {
            super.log(message);
        }
    }

    public error(error: any, trace: string) {
        if (error instanceof GraphQLError) { this.logGqlError(error); return; }
        const formatted = this.formatErrorForLogs(error);
        const message = formatted.message && typeof formatted.message === "string" ? formatted.message : null;
        this._logger.error(message, {
            timestamp: this.formatDate(new Date()),
            instance: this.id,
            trace: trace ? trace.split("\n") : defaultTrace,
            ...formatted,
        });
        if (process.env.WAL_DEBUG && process.env.WAL_DEBUG == "true") {
            delete error.args;
            super.error(error, trace);
        }
    }

    public logGqlError(error: any) {
        const message = error.message instanceof Error ? error.message.message : error.message;
        const trace = error.message instanceof Error ?
            error.message.stack :
            error.extensions && error.extensions.exception ? error.extensions.exception.stacktrace : defaultTrace;
        this._logger.error(message, {
            timestamp: this.formatDate(new Date()),
            instance: this.id,
            path: error.path,
            trace: typeof trace === "string" ? trace.split("\n") : trace
        });
        const displayTrace = Array.isArray(trace) ? trace.join("\n") : trace;
        if (process.env.WAL_DEBUG && process.env.WAL_DEBUG == "true") {
            super.error({ error: message, path: error.path }, displayTrace);
        }
    }

    /**
     * @description Formats error for simple-reading JSON logging
     * @author Quentin Wolfs
     * @private
     * @param {*} error
     * @returns {*}
     * @memberof WinstonLogger
     */
    private formatErrorForLogs(error: any): any {
        let formatted: any = {};
        if (typeof error === "object") {
            formatted = { ...formatted, ...error };
            if (error.message && typeof error.message === "object") {
                formatted = { ...error.message, ...formatted };
            }
        } else {
            formatted.message = error;
        }

        return formatted;
    }

    public warn(message: string) {
        this._logger.warn(message, {
            timestamp: this.formatDate(new Date()),
            instance: this.id
        });
        if (process.env.WAL_DEBUG && process.env.WAL_DEBUG == "true") {
            super.warn(message);
        }
    }

    public debug(message: string, toConsole: boolean = true) {
        this._logger.debug(message, {
            timestamp: this.formatDate(new Date()),
            instance: this.id
        });
        if (toConsole) { super.log(`[DEBUG] ${message}`); }
    }

    /**
     * @description Log the route / resolved called
     * @author Quentin Wolfs
     * @param {string} path
     * @param {number} status
     * @param {number} responseTime
     * @param {string} [userName]
     * @memberof WinstonLogger
     */
    public logRoute(method: string, path: string, status: number, responseTime: number, userName?: string, userId?: number) {
        this._logger[this._routeLogLevel](path, {
            method: method,
            timestamp: this.formatDate(new Date()),
            status: status,
            responseTime: responseTime,
            user: userName ? userName : "N/A",
            instance: this.id
        });
        if (process.env.WAL_DEBUG && process.env.WAL_DEBUG == "true") {
            super.log(`[${this._id}][${this._routeLogLevel.toUpperCase()}]`
                + ` ${userName ? (userName && userId ? `${userName} [${userId}]` : userName) : "N/A"}`
                + ` - [${method}] ${path} ${status} - ${responseTime} ms`);
        }
    }

    /**
     * @description Log front error into backlogs
     * @author Quentin Wolfs
     * @param {ErrorLogDto} error
     * @memberof WinstonLogger
     */
    public logFrontError(error: ErrorLogDto) {
        this._logger.error(error.message, {
            timestamp: this.formatDate(new Date()),
            trace: error.stackTrace ? error.stackTrace.split("\n") : defaultTrace,
            url: error.url
        });
    }

    /**
     * @description Format date to the DD-MM-YYYY hh:mm format
     * @author Quentin Wolfs
     * @private
     * @param {Date} date
     * @returns {string}
     * @memberof WinstonLogger
     */
    private formatDate(date: Date): string {
        const days: number = date.getDate();
        const months: number = date.getMonth() + 1;
        const hours: number = date.getHours();
        const minutes: number = date.getMinutes();

        return `${days < 10 ? `0${days}` : days}-${months < 10 ? `0${months}` : months}-${date.getFullYear()}`
        + ` ${hours < 10 ? `0${hours}` : hours}:${minutes < 10 ? `0${minutes}` : minutes}`;
    }

    /**
     * @description Initialize the Winston options
     * @author Quentin Wolfs
     * @private
     * @returns {LoggerOptions}
     * @memberof WinstonLogger
     */
    private initializeOptions(): LoggerOptions {
        return {
            options: {
                level: process.env.WAL_DEBUG && process.env.WAL_DEBUG == "true" ? "debug" : "info",
                format: winston.format.json(),
                transports: [
                    new DailyRotateFile({
                        filename: join(process.env.WAL_LOG_DIRECTORY, process.env.WAL_ERROR_LOG_FILE),
                        datePattern: "YYYY-MM",
                        level: "error",
                        maxSize: "10m",
                        extension: ".log"
                    }),
                    new DailyRotateFile({
                        filename: join(process.env.WAL_LOG_DIRECTORY, process.env.WAL_COMBINED_LOG_FILE),
                        datePattern: "YYYY-MM",
                        maxSize: "10m",
                        zippedArchive: true,
                        extension: ".log"
                    })
                ]
            },
            routeLogLevel: process.env.WAL_ROUTE_LOG_LEVEL && this.isValidLogLevel(process.env.WAL_ROUTE_LOG_LEVEL) ? process.env.WAL_ROUTE_LOG_LEVEL : "debug"
        };
    }

    /**
     * @description Check if log level exists for Winston
     * @author Quentin Wolfs
     * @private
     * @param {string} level
     * @returns {boolean}
     * @memberof WinstonLogger
     */
    private isValidLogLevel(level: string): boolean {
        return ["error", "warn", "info", "debug"].indexOf(level) !== -1;
    }
}