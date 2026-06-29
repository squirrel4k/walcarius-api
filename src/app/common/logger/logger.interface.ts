import winston = require("winston");

export interface LoggerOptions {
    options: winston.LoggerOptions;
    routeLogLevel: string;
}
