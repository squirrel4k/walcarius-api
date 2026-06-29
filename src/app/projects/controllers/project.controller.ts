import { Controller, Post, UseInterceptors, UploadedFile, BadRequestException } from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { RestLoggerInterceptor } from "../../common/interceptors/rest-logger.interceptor";
import { ReceivedFile } from "../../../core/interfaces/file.interface";
import { TeklaParserService } from "../services/tekla-parser.service";
import { ParsedTekla } from "../interfaces/tekla.interface";
import { Access } from "../../../core/decorators/access.decorator";
import { GRANT_TOKEN } from "../../common/jwt/jwt.interface";
import { ERROR_MESSAGE } from "../../../core/errors/enum/error.enum";

@Controller("api/projects")
@UseInterceptors(RestLoggerInterceptor)
export class ProjectController {

    public constructor (
        private readonly _teklaSrv: TeklaParserService
    ) { }

    @Post("parse/tekla")
    @Access(GRANT_TOKEN.FRONT_ACCESS)
    @UseInterceptors(FileInterceptor("file"))
    public async parseTeklaFile(@UploadedFile() file: ReceivedFile): Promise<ParsedTekla> {
        if (!file || !file.buffer) { throw new BadRequestException(ERROR_MESSAGE.INVALID_FILE); }
        if (file.originalname.split(".").pop() !== "csv") { throw new BadRequestException(ERROR_MESSAGE.INVALID_FILE_FORMAT); }

        return this._teklaSrv.parseCsv(file.buffer.toString());
    }
}