import { Module } from "@nestjs/common";
// ---- GUARDS ----
import { APP_GUARD } from "@nestjs/core";
import { AccessGuard } from "../../core/guards/access.guard";

// ---- IMPORTS ----
import { PassportModule } from "@nestjs/passport";
import { MongooseModule } from "@nestjs/mongoose";
import { CommonModule } from "../common/common.module";
import { UniqueNumberModule } from "../uniquenumber/uniquenumber.module";
import { PdfModule } from "../pdf/pdf.module";

// ---- ENTITIES ----
import { QuoteProjectSchema } from "./schemas/quote-project.schema";
import { QuoteSchema } from "./schemas/quote.schema";

// ---- LOADERS ----
import { QuoteProjectLoader } from "./loaders/quote-project.loader";
import { QuoteLoader } from "./loaders/quote.loader";
import { QuoteByQuoteProjectLoader } from "./loaders/quote-by-quote-project.loader";
import { DisplayQuoteByQuoteProjectLoader } from "./loaders/display-quote-by-quote-project.loader";

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
        MongooseModule.forFeature([
            { name: "projects", schema: QuoteProjectSchema },
            { name: "quotes", schema: QuoteSchema }
        ]),
        CommonModule,
        UniqueNumberModule,
        PdfModule,UserModule,AuthModule
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
        DisplayQuoteByQuoteProjectLoader,
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