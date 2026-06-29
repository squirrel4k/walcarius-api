import { Controller, Post, UsePipes, ValidationPipe, HttpCode, Body } from "@nestjs/common";
import { ErrorLogDto } from "../dto/error.dto";
import { WinstonLogger } from "../logger/winston.logger";

@Controller("api/error")
export class ErrorController {

    public constructor(
        private readonly _logger: WinstonLogger
    ) { }

    @Post("/log")
    @UsePipes(ValidationPipe)
    @HttpCode(200)
    public async logError(@Body() dto: ErrorLogDto): Promise<boolean> {
        this._logger.logFrontError(dto);
        return true;
    }
}