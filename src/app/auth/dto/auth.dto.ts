import { IsNotEmpty, IsString } from "class-validator";

export class RequireTokenDto {
    @IsNotEmpty()
    @IsString()
    readonly email: string;

    @IsNotEmpty()
    @IsString()
    readonly password: string;
}