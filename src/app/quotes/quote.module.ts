import { Module } from "@nestjs/common";
// ---- GUARDS ----
import { APP_GUARD } from "@nestjs/core";
import { AccessGuard } from "../../core/guards/access.guard";

// ---- IMPORTS ----
import { PassportModule } from "@nestjs/passport";
import { TypeOrmModule } from "@nestjs/typeorm";
import { CommonModule } from "../common/common.module";
import { UniqueNumberModule } from "../uniquenumber/uniquenumber.module";
import { PdfModule } from "../pdf/pdf.module";

// ---- ENTITIES ----
import { QuoteProjectEntity } from "./entities/quote-project.entity";
import { QuoteEntity } from "./entities/quote.entity";

// ---- LOADERS ----
import { QuoteProjectLoader } from "./loaders/quote-project.loader";
import { QuoteLoader } from "./loaders/quote.loader";
import { QuoteByQuoteProjectLoader } from "./loaders/quote-by-quote-project.loader";

// ---- SERVICES ----
import { QuoteProjectService } from "./services/quote-project.service";
import { QuoteService } from "./services/quote.service";

// ---- RESOLVERS ----
import { QuoteProjectResolver } from "./resolvers/quote-project.resolver";
import { QuoteResolver } from "./resolvers/quote.resolver";

// ---- CONTROLLERS ----
import { QuoteController } from "./controllers/quote.controller";
import { UserService } from "../users/services/user.service";
import { UserModule } from "../users/user.module";
import { AuthModule } from "../auth/auth.module";

@Module({
    imports: [
        PassportModule.register({ defaultStrategy: "jwt" }),
        TypeOrmModule.forFeature([QuoteProjectEntity, QuoteEntity]),
        CommonModule,
        UniqueNumberModule,
        PdfModule, UserModule, AuthModule
    ],
    providers: [
        { provide: APP_GUARD, useClass: AccessGuard },
        QuoteProjectService,
        QuoteProjectLoader,
        QuoteProjectResolver,
        QuoteLoader,
        QuoteService,
        QuoteResolver,
        QuoteByQuoteProjectLoader,
    ],
    controllers: [
        QuoteController
    ],
    exports: [
        QuoteProjectService,
        QuoteService
    ]
})
export class QuoteModule { }