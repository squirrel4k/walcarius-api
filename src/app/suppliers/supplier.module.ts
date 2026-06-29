import { Module } from "@nestjs/common";
// ---- GUARDS ----
import { APP_GUARD } from "@nestjs/core";
import { AccessGuard } from "../../core/guards/access.guard";

// ---- IMPORTS ----
import { PassportModule } from "@nestjs/passport";
import { TypeOrmModule } from "@nestjs/typeorm";
import { CommonModule } from "../common/common.module";
import { ElementModule } from "../elements/element.module";

// ---- ENTITIES ----
import { SupplierSql } from "./entities/supplier.entity";
import { SupplierContactSql } from "./entities/supplier-contact.entity";
import { SupplyCategorySql } from "./entities/supply-category.entity";
import { SupplyCategorySupplierSql } from "./entities/supply-category-supplier.entity";
import { SupplyCategoryNatureSql } from "./entities/supply-category-nature.entity";
import { SupplierMatterSql } from "./entities/supplier-matter.entity";

// ---- LOADERS ----
import { SupplierLoader } from "./loaders/supplier.loader";
import { SupplierContactLoader } from "./loaders/supplier-contact.loader";
import { SupplierContactBySupplierLoader } from "./loaders/supplier-contact-by-supplier.loader";
import { SupplyCategoryLoader } from "./loaders/supply-category.loader";
import { SubSupplyCategoryLoader } from "./loaders/sub-supply-category.loader";
import { NatureBySupplyCategoryLoader } from "./loaders/nature-by-supply-category.loader";
import { SupplierBySupplyCategoryLoader } from "./loaders/supplier-by-supply-category.nature";
import { SupplyCategoryBySupplierLoader } from "./loaders/supply-category-by-supplier.loader";
import { ParentSupplyCategoryBySupplierLoader } from "./loaders/parent-supply-category-by-supplier.loader";
import { ParentSupplyCategoryBySupplyListLoader } from "./loaders/parent-supply-category-by-supply-list.loader";
import { MatterBySupplierLoader } from "./loaders/matter-by-supplier.loader";

// ---- SERVICES ----
import { SupplierService } from "./services/supplier.service";
import { SupplierContactService } from "./services/supplier-contact.service";
import { SupplyCategoryService } from "./services/supply-category.service";
import { SupplyCategorySupplierService } from "./services/supply-category-supplier.service";
import { SupplierMatterService } from "./services/supplier-matter.service";

// ---- RESOLVERS ----
import { SupplierResolver } from "./resolvers/supplier.resolver";
import { SupplierContactResolver } from "./resolvers/supplier-contact.resolver";
import { SupplyCategoryResolver } from "./resolvers/supply-category.resolver";
import { AuthModule } from "../auth/auth.module";

@Module({
    imports: [
        PassportModule.register({ defaultStrategy: "jwt" }),
        TypeOrmModule.forFeature([SupplierSql, SupplierContactSql, SupplyCategorySql, SupplyCategorySupplierSql, SupplyCategoryNatureSql, SupplierMatterSql]),
        CommonModule,
        ElementModule,
        AuthModule
    ],
    providers: [
        { provide: APP_GUARD, useClass: AccessGuard },
        SupplierService,
        SupplierLoader,
        SupplierResolver,
        SupplierContactService,
        SupplierContactLoader,
        SupplierContactBySupplierLoader,
        SupplierContactResolver,
        SupplyCategoryService,
        SupplyCategoryLoader,
        SubSupplyCategoryLoader,
        SupplyCategoryResolver,
        SupplyCategorySupplierService,
        NatureBySupplyCategoryLoader,
        SupplierBySupplyCategoryLoader,
        SupplyCategoryBySupplierLoader,
        ParentSupplyCategoryBySupplierLoader,
        ParentSupplyCategoryBySupplyListLoader,
        MatterBySupplierLoader,
        SupplierMatterService
    ],
    exports: [
        SupplierService,
        SupplierContactService,
        SupplyCategoryService
    ]
})
export class SupplierModule { }