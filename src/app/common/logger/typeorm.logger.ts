import * as winston from "winston";
import * as DailyRotateFile from "winston-daily-rotate-file";
import { join } from "path";
import { QueryRunner, AdvancedConsoleLogger } from "typeorm";
import { DateUtil } from "../../../core/utils/date.util";

export class TypeOrmLogger extends AdvancedConsoleLogger {

    private readonly _logger: winston.Logger;
    private _id: string;
    private _options: "all" | ("log" | "info" | "warn" | "query" | "schema" | "error" | "migration")[] | undefined;
    private _toWinston: boolean;

    constructor(options?: string) {
        // Format options for TypeORM advanced logger
        const envOptions = !!options ? options.split(/, */) : undefined;
        let opts: "all" | ("log" | "info" | "warn" | "query" | "schema" | "error" | "migration")[] | undefined;
        if (!envOptions || envOptions.length === 0) {
            opts = undefined;
        } else if (envOptions.includes("all")) {
            opts = "all";
        } else {
            const tmpOpts = [];
            ["log", "info", "warn", "query", "schema", "error", "migration"].forEach(baseOpt => {
                if (envOptions.includes(baseOpt)) { tmpOpts.push(baseOpt); }
            });
            opts = tmpOpts.length > 0 ? tmpOpts : undefined;
        }
        super(opts);

        // Save base config
        this._options = opts;
        this._toWinston = !!process.env.WAL_QUERY_LOG_FILE;
        this._id = process.env.NODE_APP_INSTANCE ? process.env.NODE_APP_INSTANCE : "0";

        // Save winston transport
        if (this._toWinston) {
            const loggerOptions = this.initializeWinstonOptions();
            this._logger = winston.createLogger(loggerOptions);
        }
    }

    private get id(): string {
        return this._id ? this._id : "N/A";
    }

    /**
     * @description Initialize the Winston options
     * @author Quentin Wolfs
     * @private
     * @returns {winston.LoggerOptions}
     * @memberof WinstonLogger
     */
    private initializeWinstonOptions(): winston.LoggerOptions {
        return {
            level: process.env.WAL_DEBUG && process.env.WAL_DEBUG == "true" ? "debug" : "info",
            format: winston.format.json(),
            transports: [
                new DailyRotateFile({
                    filename: join(process.env.WAL_LOG_DIRECTORY, process.env.WAL_QUERY_LOG_FILE),
                    datePattern: "YYYY-MM",
                    maxSize: "10m",
                    extension: ".log"
                })
            ]
        };
    }

    /**
     * @description Logs query and parameters used in it.
     * @author Quentin Wolfs
     * @param {string} query
     * @param {any[]} [parameters]
     * @param {QueryRunner} [queryRunner]
     * @returns {*}
     * @memberof WinstonLogger
     */
    public logQuery(query: string, parameters?: any[], queryRunner?: QueryRunner): any {
        if (this._options === "all" || (Array.isArray(this._options) && this._options.includes("query"))) {
            if (this._toWinston) {
                this._logger.info({
                    timestamp: DateUtil.displayDate(new Date(), "DD-MM-YYYY hh:mm"),
                    instance: this.id,
                    query,
                    parameters
                });
            } else {
                super.logQuery(query, parameters, queryRunner);
            }
        }
    }

    /**
     * @description
     * @author Quentin Wolfs
     * @param {string} error
     * @param {string} query
     * @param {any[]} [parameters]
     * @param {QueryRunner} [queryRunner]
     * @returns {*}
     * @memberof WinstonLogger
     */
    public logQueryError(error: string, query: string, parameters?: any[], queryRunner?: QueryRunner): any {
        if (this._options === "all" || (Array.isArray(this._options) && this._options.includes("error"))) {
            if (this._toWinston) {
                this._logger.error(error, {
                    timestamp: DateUtil.displayDate(new Date(), "DD-MM-YYYY hh:mm"),
                    instance: this.id,
                    query,
                    parameters
                });
            } else {
                super.logQueryError(error, query, parameters, queryRunner);
            }
        }
    }

    /**
     * @description Logs query that is slow.
     * @author Quentin Wolfs
     * @param {number} time
     * @param {string} query
     * @param {any[]} [parameters]
     * @param {QueryRunner} [queryRunner]
     * @returns {*}
     * @memberof WinstonLogger
     */
    public logQuerySlow(time: number, query: string, parameters?: any[], queryRunner?: QueryRunner): any {
        if (this._toWinston) {
            this._logger.warn("Slow query", {
                timestamp: DateUtil.displayDate(new Date(), "DD-MM-YYYY hh:mm"),
                instance: this.id,
                query,
                parameters,
                time
            });
        } else {
            super.logQuerySlow(time, query, parameters, queryRunner);
        }
    }

    /**
     * @description Logs events from the schema build process.
     * @author Quentin Wolfs
     * @param {string} message
     * @param {QueryRunner} [queryRunner]
     * @returns {*}
     * @memberof WinstonLogger
     */
    public logSchemaBuild(message: string, queryRunner?: QueryRunner) {
        if (this._options === "all" || (Array.isArray(this._options) && this._options.includes("schema"))) {
            if (this._toWinston) {
                this._logger.warn(message, {
                    timestamp: DateUtil.displayDate(new Date(), "DD-MM-YYYY hh:mm"),
                    instance: this.id
                });
            } else {
                super.logSchemaBuild(message, queryRunner);
            }
        }
    }

    /**
     * @description Logs events from the migrations run process.
     * @author Quentin Wolfs
     * @param {string} message
     * @param {QueryRunner} [queryRunner]
     * @returns {*}
     * @memberof WinstonLogger
     */
    public logMigration(message: string, queryRunner?: QueryRunner): any {
        if (this._options === "all" || (Array.isArray(this._options) && this._options.includes("migration"))) {
            if (this._toWinston) {
                this._logger.warn(message, {
                    timestamp: DateUtil.displayDate(new Date(), "DD-MM-YYYY hh:mm"),
                    instance: this.id
                });
            } else {
                super.logMigration(message, queryRunner);
            }
        }
    }

    /**
     * @description Perform logging using given logger, or by default to the console.
     * Log has its own level and message.
     * @author Quentin Wolfs
     * @param {("log" | "info" | "warn")} level
     * @param {*} message
     * @param {QueryRunner} [queryRunner]
     * @returns {*}
     * @memberof WinstonLogger
     */
    public log(level: "log" | "info" | "warn", message: any, queryRunner?: QueryRunner): any {
        if (this._options === "all" || (Array.isArray(this._options) && this._options.includes(level))) {
            if (this._toWinston) {
                this._logger.log(level, "", {
                    message,
                    timestamp: DateUtil.displayDate(new Date(), "DD-MM-YYYY hh:mm"),
                    instance: this.id
                });
            } else {
                super.log(level, message, queryRunner);
            }
        }
    }
}