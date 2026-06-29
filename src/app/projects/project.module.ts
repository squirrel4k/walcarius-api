import { Module, forwardRef } from "@nestjs/common";
// ---- GUARDS ----
import { APP_GUARD } from "@nestjs/core";
import { AccessGuard } from "../../core/guards/access.guard";

// ---- IMPORTS ----
import { PassportModule } from "@nestjs/passport";
import { TypeOrmModule } from "@nestjs/typeorm";
import { CommonModule } from "../common/common.module";
import { ElementModule } from "../elements/element.module";
import { SupplierModule } from "../suppliers/supplier.module";
import { PriceRequestModule } from "../price-requests/price-request.module";
import { PurchaseOrderModule } from "../purchase-orders/purchase-order.module";

// ---- ENTITIES ----
import { ProjectSql } from "./entities/project.entity";
import { SupplyListSql } from "./entities/supply-list.entity";
import { SupplyListElementSql } from "./entities/supply-list-element.entity";

// ---- CONTROLLERS ----
import { ProjectController } from "./controllers/project.controller";

// ---- LOADERS ----
import { ProjectLoader } from "./loaders/project.loader";
import { SupplyListLoader } from "./loaders/supply-list.loader";
import { SupplyListByProjectLoader } from "./loaders/supply-list-by-project.loader";
import { SupplyListElementBySupplyListLoader } from "./loaders/supply-list-element-by-supply-list.loader";
import { SupplyListElementLoader } from "./loaders/supply-list-element.loader";
import { SupplyListByPriceRequestLoader } from "./loaders/supply-list-by-price-request.loader";
import { ProjectByPurchaseOrderLoader } from "./loaders/project-by-purchase-order.loader";
import { InfosBySupplyListLoader } from "./loaders/infos-by-supply-list.loader";
import { ProjectByPriceRequestLoader } from "./loaders/project-by-price-request.loader";
import { TotalSupplyListByProjectLoader } from "./loaders/total-supply-list-by-project.loader";
import { UnusedSupplyListByProjectLoader } from "./loaders/unused-supply-list-by-project.loader";

// ---- SERVICES ----
import { ProjectService } from "./services/project.service";
import { SupplyListService } from "./services/supply-list.service";
import { TeklaParserService } from "./services/tekla-parser.service";
import { SupplyListElementService } from "./services/supply-list-element.service";

// ---- RESOLVERS ----
import { ProjectResolver } from "./resolvers/project.resolver";
import { SupplyListResolver } from "./resolvers/supply-list.resolver";
import { SupplyListElementResolver } from "./resolvers/supply-list-element.resolver";
import { AuthModule } from "../auth/auth.module";

@Module({
    imports: [
        PassportModule.register({ defaultStrategy: "jwt" }),
        TypeOrmModule.forFeature([ProjectSql, SupplyListSql, SupplyListElementSql]),
        CommonModule,
        ElementModule,
        AuthModule,
        SupplierModule,
        forwardRef(() => PriceRequestModule),
        forwardRef(() => PurchaseOrderModule)
    ],
    controllers: [
        ProjectController
    ],
    providers: [
        { provide: APP_GUARD, useClass: AccessGuard },
        ProjectLoader,
        ProjectService,
        ProjectResolver,
        SupplyListLoader,
        SupplyListByProjectLoader,
        SupplyListByPriceRequestLoader,
        SupplyListService,
        SupplyListResolver,
        TeklaParserService,
        SupplyListElementService,
        SupplyListElementLoader,
        SupplyListElementBySupplyListLoader,
        SupplyListElementResolver,
        InfosBySupplyListLoader,
        ProjectByPurchaseOrderLoader,
        ProjectByPriceRequestLoader,
        TotalSupplyListByProjectLoader,
        UnusedSupplyListByProjectLoader
    ],
    exports: [
        ProjectService,
        SupplyListService,
        SupplyListElementService
    ]
})
export class ProjectModule { }