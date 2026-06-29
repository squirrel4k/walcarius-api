import { Module } from "@nestjs/common";
// ---- IMPORTS ----
import { JwtModule } from "@nestjs/jwt";

// ---- CONTROLLERS ----
import { ErrorController } from "./controllers/error.controller";

// ---- SERVICES ----
import { WinstonLogger } from "./logger/winston.logger";
import { JwtWrapperService } from "./jwt/jwt.service";

// ---- INTERCEPTORS ----
import { RestLoggerInterceptor } from "./interceptors/rest-logger.interceptor";
import { GqlLoggerInterceptor } from "./interceptors/gql-logger.interceptor";

// ---- SCALARS ----
import { DateScalar } from "./scalars/date.scalar";

@Module({
    imports: [
        JwtModule.registerAsync({
            useFactory: () => ({
                secretOrPrivateKey: process.env.WAL_AUTH_SECRET_KEY,
                signOptions: {
                    expiresIn: process.env.WAL_AUTH_EXPIRE
                }
            })
        })
    ],
    controllers: [
        ErrorController
    ],
    providers: [
        JwtWrapperService,
        WinstonLogger,
        RestLoggerInterceptor,
        GqlLoggerInterceptor,
        DateScalar
    ],
    exports: [
        JwtWrapperService,
        WinstonLogger,
        RestLoggerInterceptor,
        GqlLoggerInterceptor
    ]
})
export class CommonModule { }