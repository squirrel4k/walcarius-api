import { Request } from "express";
import { Module } from "@nestjs/common";
// ---- IMPORTS ----
import { GraphQLModule } from "@nestjs/graphql";
import { ApolloDriver, ApolloDriverConfig } from "@nestjs/apollo";
import { TypeOrmModule } from "@nestjs/typeorm";
import { PassportModule } from "@nestjs/passport";

// ---- MODULES ----
import { AuthModule } from "./auth/auth.module";
import { CommonModule } from "./common/common.module";
import { QuoteModule } from "./quotes/quote.module";
import { UniqueNumberModule } from "./uniquenumber/uniquenumber.module";
import { ElementModule } from "./elements/element.module";
import { SupplierModule } from "./suppliers/supplier.module";
import { ProjectModule } from "./projects/project.module";
import { PriceRequestModule } from "./price-requests/price-request.module";
import { PurchaseOrderModule } from "./purchase-orders/purchase-order.module";
import { SmtpConfigModule } from "./smtp-config/smtp-config.module";

// ---- GUARDS ----
import { AuthenticationGuard } from "../core/guards/auth.guard";

// ---- INTERCEPTORS ----
import { JwtInterceptor } from "../core/interceptors/jwt.interceptor";
import { UuidInterceptor } from "../core/interceptors/uuid.interceptor";

// ---- MISC ----
import GraphqlJSON from "graphql-type-json";
import { APP_GUARD, APP_INTERCEPTOR } from "@nestjs/core";
import { CORS_OPTIONS } from "../main";
import { LoaderManager } from "../core/dataloader/loader.manager";
import { GraphQLFormattedError } from "graphql";
import { ErrorFormatterUtil } from "../core/errors/utils/error-formatter.util";
import { WinstonLogger } from "./common/logger/winston.logger";
import { TypeOrmLogger } from "./common/logger/typeorm.logger";
import { PaginationPlugin } from "../core/graphql/extensions/pagination.plugin";
import { PermissionModule } from "./permission/permission.module";
import { PurchaseOrderAdmissionLogModule } from "./purchase-order-admission-log/purchase-order-admission-log.module";
import { ScanPdfModule } from "./scan-pdf/scan-pdf.module";
import { FileController } from "./files/files.controllers";


@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      useFactory: () => ({
        type: "mysql",
        host: process.env.WAL_MYSQL_HOST,
        port: parseInt(process.env.WAL_MYSQL_PORT, 10),
        username: process.env.WAL_MYSQL_USER,
        password: process.env.WAL_MYSQL_PASSWORD,
        database: process.env.WAL_MYSQL_DBNAME,
        entities: [__dirname + "/**/*.entity{.ts,.js}"],
        maxQueryExecutionTime: 1000,
        logger: new TypeOrmLogger(process.env.WAL_MYSQL_LOG_CONFIG)
      })
    }),
    GraphQLModule.forRootAsync<ApolloDriverConfig>({
      driver: ApolloDriver,
      useFactory: (logger: WinstonLogger) => ({
        typePaths: ["./**/*.graphql"],
        resolvers: { JSON: GraphqlJSON },
        context: ({ req }: { req: Request }) => ({ req }),
        formatError: (error: GraphQLFormattedError) => ErrorFormatterUtil.format(error as any, logger),
        includeStacktraceInErrorResponses: process.env.WAL_DEBUG === "true",
        introspection: process.env.WAL_GRAPHQL_INTROSPECTION === "true",
        plugins: [
          new PaginationPlugin(),
          // Nettoyage des DataLoaders en fin de requête
          {
            async requestDidStart() {
              return {
                async willSendResponse({ contextValue }: { contextValue: any }) {
                  if (contextValue?.req?.requestUUID) {
                    LoaderManager.Mngr.unset(contextValue.req.requestUUID);
                  }
                }
              };
            }
          }
        ],
      }),
      imports: [CommonModule],
      inject: [WinstonLogger]
    }),
    PassportModule.register({
      defaultStrategy: "jwt"
    }),
    CommonModule,
    AuthModule,
    UniqueNumberModule,
    QuoteModule,
    ElementModule,
    SupplierModule,
    ProjectModule,
    PriceRequestModule,
    PurchaseOrderModule,
    SmtpConfigModule,
    PermissionModule,
    PurchaseOrderAdmissionLogModule,
    ScanPdfModule
  ],
  controllers: [FileController],
  providers: [
    { provide: APP_GUARD, useClass: AuthenticationGuard },
    { provide: APP_INTERCEPTOR, useClass: JwtInterceptor },
    { provide: APP_INTERCEPTOR, useClass: UuidInterceptor }
  ],
})
export class AppModule {}