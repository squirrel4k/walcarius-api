import { IsString } from "class-validator";

export class ErrorLogDto {
    @IsString()
    readonly url: string;

    @IsString()
    readonly message: string;

    @IsString()
    readonly stackTrace: string;
}