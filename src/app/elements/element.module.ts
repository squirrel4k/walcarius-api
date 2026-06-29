import { Module } from "@nestjs/common";
// ---- GUARDS ----
import { APP_GUARD } from "@nestjs/core";
import { AccessGuard } from "../../core/guards/access.guard";

// ---- IMPORTS ----
import { PassportModule } from "@nestjs/passport";
import { TypeOrmModule } from "@nestjs/typeorm";
import { CommonModule } from "../common/common.module";

// ---- ENTITIES ----
import { MatterSql } from "./entities/matter.entity";
import { CategorySql } from "./entities/category.entity";
import { ElementGroupSql } from "./entities/element-group.entity";
import { ElementGroupNatureSql } from "./entities/element-group-nature.entity";
import { ElementGroupMatterSql } from "./entities/element-group-matter.entity";
import { ElementSql } from "./entities/element.entity";
import { NatureSql } from "./entities/nature.entity";
import { ActionGroupSql } from "./entities/action-group.entity";
import { ActionGroupParameterSql } from "./entities/action-group-parameter.entity";
import { ActionSql } from "./entities/action.entity";

// ---- SERVICES ----
import { MatterService } from "./services/matter.service";
import { CategoryService } from "./services/category.service";
import { ElementGroupService } from "./services/element-group.service";
import { ElementService } from "./services/element.service";
import { NatureService } from "./services/nature.service";
import { ActionGroupService } from "./services/action-group.service";
import { ActionService } from "./services/action.service";

// ---- LOADERS ----
import { MatterLoader } from "./loaders/matter.loader";
import { CategoryLoader } from "./loaders/category.loader";
import { ElementGroupLoader } from "./loaders/element-group.loader";
import { ElementLoader } from "./loaders/element.loader";
import { NatureByElementGroupLoader } from "./loaders/nature-by-element-group.loader";
import { ActionGroupLoader } from "./loaders/action-group.loader";
import { MatterByElementGroupLoader } from "./loaders/matter-by-element-group.loader";
import { ElementByElementGroupLoader } from "./loaders/element-by-element-group.loader";
import { ChildrenCategoryLoader } from "./loaders/children-category.loader";
import { ElementGroupByCategoryLoader } from "./loaders/element-group-by-category.loader";
import { ActionByActionGroupLoader } from "./loaders/action-by-action-group.loader";
import { NatureByActionGroupLoader } from "./loaders/nature-by-action-group.loader";
import { MatterByActionGroupLoader } from "./loaders/matter-by-action-group.loader";
import { ElementByElementGroupAndMatterLoader } from "./loaders/element-by-element-group-and-matter.loader";

// ---- RESOLVERS ----
import { MatterResolver } from "./resolvers/matter.resolver";
import { CategoryResolver } from "./resolvers/category.resolver";
import { ElementGroupResolver } from "./resolvers/element-group.resolver";
import { ElementResolver } from "./resolvers/element.resolver";
import { ActionGroupResolver } from "./resolvers/action-group.resolver";
import { ActionResolver } from "./resolvers/action.resolver";
import { AuthModule } from "../auth/auth.module";

@Module({
    imports: [
        PassportModule.register({ defaultStrategy: "jwt" }),
        TypeOrmModule.forFeature([
            MatterSql, CategorySql, ElementGroupSql, ElementGroupNatureSql, ElementGroupMatterSql, ElementSql, NatureSql, ActionGroupSql, ActionGroupParameterSql, ActionSql
        ]),
        CommonModule,AuthModule
    ],
    providers: [
        { provide: APP_GUARD, useClass: AccessGuard },
        MatterService,
        MatterLoader,
        MatterResolver,
        CategoryService,
        CategoryLoader,
        CategoryResolver,
        ElementGroupService,
        ElementGroupLoader,
        ElementGroupResolver,
        ElementService,
        ElementLoader,
        ElementResolver,
        NatureService,
        ActionGroupService,
        ActionGroupLoader,
        ActionGroupResolver,
        ActionService,
        ActionResolver,
        NatureByElementGroupLoader,
        MatterByElementGroupLoader,
        ElementByElementGroupLoader,
        ChildrenCategoryLoader,
        ElementGroupByCategoryLoader,
        ActionByActionGroupLoader,
        NatureByActionGroupLoader,
        MatterByActionGroupLoader,
        ElementByElementGroupAndMatterLoader
    ],
    exports: [
        MatterService,
        CategoryService,
        ElementGroupService,
        ElementService,
        NatureService,
        ActionGroupService,
        ActionService
    ]
})
export class ElementModule { }