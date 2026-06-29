import { Module } from "@nestjs/common";
// ---- GUARDS ----
import { APP_GUARD } from "@nestjs/core";
import { AccessGuard } from "../../core/guards/access.guard";

// ---- IMPORTS ----
import { TypeOrmModule } from "@nestjs/typeorm";
import { PassportModule } from "@nestjs/passport";
import { CommonModule } from "../common/common.module";
// ---- ENTITIES ----
import { PermissionSql } from "./entities/permission.entity";

// ---- LOADERS ----
import { PermissionLoader } from "./loaders/permission.loader";

// ---- SERVICES ----
import { PermissionService } from "./services/permission.service";

// ---- RESOLVERS ----
import { PermissionResolver } from "./resolvers/permission.resolver";

@Module({
    imports: [
        PassportModule.register({ defaultStrategy: "jwt" }),
        TypeOrmModule.forFeature([PermissionSql]),
        CommonModule
    ],
    controllers: [],
    providers: [
        { provide: APP_GUARD, useClass: AccessGuard },
        PermissionService,
        PermissionLoader,
        PermissionResolver

    ],
    exports: [
        PermissionService
    ]
})
export class PermissionModule{ }