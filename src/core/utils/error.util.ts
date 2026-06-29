import { InternalServerErrorException, HttpException } from "@nestjs/common";

export const ErrorUtil = new class {

    /**
     * @description Get the corresponding encapsulated Exception for NestJS. If already encapsulated, does nothing. Defaults on InternalServerErrorException
     * @author Quentin Wolfs
     * @param {*} error
     * @param {(new(message?: string | object | any, error?: string) => HttpException)} [errorType]
     * @returns {HttpException}
     */
    public get(error: any, errorType?: new(message?: string | object | any, error?: string) => HttpException): HttpException {
        if (error instanceof HttpException) {
            return error;
        }
        return errorType ?
            new errorType(error) :
            new InternalServerErrorException(error);
    }
};