import { Module, forwardRef } from "@nestjs/common";
// ---- GUARDS ----
import { APP_GUARD } from "@nestjs/core";
import { AccessGuard } from "../../core/guards/access.guard";

// ---- IMPORTS ----
import { PassportModule } from "@nestjs/passport";
import { TypeOrmModule } from "@nestjs/typeorm";
import { CommonModule } from "../common/common.module";
import { UniqueNumberModule } from "../uniquenumber/uniquenumber.module";
import { PdfModule } from "../pdf/pdf.module";
import { ProjectModule } from "../projects/project.module";
import { ElementModule } from "../elements/element.module";
import { SupplierModule } from "../suppliers/supplier.module";
import { MailerModule } from "../mailer/mailer.module";
import { UserModule } from "../users/user.module";

// ---- ENTITIES ----
import { PriceRequestSql } from "./entities/price-request.entity";
import { AmalgamSql } from "./entities/amalgam.entity";
import { AmalgamPartSql } from "./entities/amalgam-part.entity";
import { AmalgamGroupSql } from "./entities/amalgam-group.entity";
import { PriceRequestElementSql } from "./entities/price-request-element.entity";
import { SupplierOfferSql } from "./entities/supplier-offer.entity";
import { SupplierOfferElementSql } from "./entities/supplier-offer-element.entity";
import { VariantSql } from "./entities/variant.entity";
import { SupplierOfferAdditionnalCostSql } from "./entities/supplier-offer-additionnal-cost.entity";
import { PriceRequestAdditionnalCostSql } from "./entities/price-request-additionnal-cost.entity";
import { PriceRequestElementOptionSql } from "./entities/price-request-element-option.entity";
import { SupplierOfferElementOptionSql } from "./entities/supplier-offer-element-option.entity";
import { VariantOptionSql } from "./entities/variant-option.entity";
import { BarsetGenerationSql } from "./entities/barset-generation.entity";

// ---- LOADERS ----
import { PriceRequestLoader } from "./loaders/price-request.loader";
import { AmalgamLoader } from "./loaders/amalgam.loader";
import { AmalgamPartLoader } from "./loaders/amalgam-part.loader";
import { AmalgamPartByAmalgamLoader } from "./loaders/amalgam-part-by-amalgam.loader";
import { PriceRequestElementLoader } from "./loaders/price-request-element.loader";
import { AmalgamGroupLoader } from "./loaders/amalgam-group.loader";
import { AmalgamByAmalgamGroupLoader } from "./loaders/amalgam-by-amalgam-group.loader";
import { PriceRequestElementByPriceRequestLoader } from "./loaders/price-request-element-by-price-request.loader";
import { SupplierOfferElementLoader } from "./loaders/supplier-offer-element.loader";
import { SupplierOfferElementBySupplierOfferLoader } from "./loaders/supplier-offer-element-by-supplier-offer.loader";
import { TotalPriceBySupplierOfferLoader } from "./loaders/total-price-by-supplier-offer.loader";
import { BestPriceByPriceRequestElementLoader } from "./loaders/best-price-by-price-request-element.loader";
import { BestTimeByPriceRequestElementLoader } from "./loaders/best-time-by-price-request-element.loader";
import { SOElementByPossiblePRElementLoader } from "./loaders/supplier-offer-element-by-possible-price-request-element.loader";
import { PossiblePRElementBySupplierOfferLoader } from "./loaders/possible-price-request-element-by-supplier-offer.loader";
import { SupplierOfferLoader } from "./loaders/supplier-offer.loader";
import { SupplierOfferByPriceRequestLoader } from "./loaders/supplier-offer-by-price-request.loader";
import { SupplierOfferElementByPriceRequestElementLoader } from "./loaders/supplier-offer-element-by-price-request-element.loader";
import { VariantLoader } from "./loaders/variant.loader";
import { SupplierOfferAdditionnalCostLoader } from "./loaders/supplier-offer-additionnal-cost.loader";
import { SupplierOfferAdditionnalCostBySupplierOfferLoader } from "./loaders/supplier-offer-additionnal-cost-by-supplier-offer.loader";
import { TotalAdditionnalCostBySupplierOfferLoader } from "./loaders/total-additionnal-cost-by-supplier-offer.loader";
import { ParentSupplyCategoryByPriceRequestElementLoader } from "./loaders/parent-supply-category-by-price-request-element.loader";
import { StockQuantityByAmalgamGroupLoader } from "./loaders/stock-quantity-by-amalgam-group.loader";
import { PriceRequestAdditionnalCostLoader } from "./loaders/price-request-additionnal-cost.loader";
import { PriceRequestAdditionnalCostByPriceRequestLoader } from "./loaders/price-request-additionnal-cost-by-price-request.loader";
import { SupplierOfferACByPriceRequestACLoader } from "./loaders/supplier-offer-ac-by-price-request-ac.loader";
import { PriceRequestElementOptionLoader } from "./loaders/price-request-element-option.loader";
import { PREOptionByPriceRequestElementLoader } from "./loaders/price-request-element-option-by-price-request-element.loader";
import { SupplierOfferElementOptionLoader } from "./loaders/supplier-offer-element-option.loader";
import { SOEOptionByPREOptionLoader } from "./loaders/supplier-offer-element-option-by-price-request-element.loader";
import { VariantOptionLoader } from "./loaders/variant-option.loader";
import { VariantOptionByVariantLoader } from "./loaders/variant-option-by-variant.loader";
import { SOEOptionBySupplierOfferElementLoader } from "./loaders/supplier-offer-element-option-by-supplier-offer-element.loader";
import { PurchaseOrderQuantityByPriceRequestElementLoader } from "./loaders/purchase-order-quantity-by-price-request-element.loader";
import { PurchaseOrderQuantityByVariantLoader } from "./loaders/purchase-order-quantity-by-variant.loader";
import { BarsetGenerationLoader } from "./loaders/barset-generation.loader";
import { BarsetGenerationByPriceRequestLoader } from "./loaders/barset-generation-by-price-request.loader";
import { BestPriceByPriceRequestElementOptionLoader } from "./loaders/best-price-by-price-request-element-option.loader";
import { ComputedPriceBySupplierOfferElementLoader } from "./loaders/computed-price-by-supplier-offer-element.loader";
import { HasPriceByPriceRequestElementLoader } from "./loaders/has-price-by-price-request-element.loader";
import { BestPriceByPriceRequestAdditionnalCostLoader } from "./loaders/best-price-by-price-request-additionnal-cost.loader";

// ---- SERVICES ----
import { PriceRequestService } from "./services/price-request.service";
import { AmalgamService } from "./services/amalgam.service";
import { AmalgamPartService } from "./services/amalgam-part.service";
import { PriceRequestElementService } from "./services/price-request-element.service";
import { AmalgamGroupService } from "./services/amalgam-group.service";
import { SupplierOfferService } from "./services/supplier-offer.service";
import { SupplierOfferElementService } from "./services/supplier-offer-element.service";
import { VariantService } from "./services/variant.service";
import { SupplierOfferAdditionnalCostService } from "./services/supplier-offer-additionnal-cost.service";
import { PriceRequestAdditionnalCostService } from "./services/price-request-additionnal-cost.service";
import { PriceRequestElementOptionService } from "./services/price-request-element-option.service";
import { SupplierOfferElementOptionService } from "./services/supplier-offer-element-option.service";
import { VariantOptionService } from "./services/variant-option.service";
import { BarsetGenerationService } from "./services/barset-generation.service";

// ---- RESOLVERS ----
import { PriceRequestResolver } from "./resolvers/price-request.resolver";
import { AmalgamResolver } from "./resolvers/amalgam.resolver";
import { AmalgamPartResolver } from "./resolvers/amalgam-part.resolver";
import { PriceRequestElementResolver } from "./resolvers/price-request-element.resolver";
import { AmalgamGroupResolver } from "./resolvers/amalgam-group.resolver";
import { SupplierOfferResolver } from "./resolvers/supplier-offer.resolver";
import { SupplierOfferElementResolver } from "./resolvers/supplier-offer-element.resolver";
import { PossiblePriceRequestElementResolver } from "./resolvers/possible-price-request-element.resolver";
import { VariantResolver } from "./resolvers/variant.resolver";
import { SupplierOfferAdditionnalCostResolver } from "./resolvers/supplier-offer-additionnal-cost.resolver";
import { PriceRequestAdditionnalCostResolver } from "./resolvers/price-request-additionnal-cost.resolver";
import { PriceRequestElementOptionResolver } from "./resolvers/price-request-element-option.resolver";
import { SupplierOfferElementOptionResolver } from "./resolvers/supplier-offer-element-option.resolver";
import { VariantOptionResolver } from "./resolvers/variant-option.resolver";
import { BarsetGenerationResolver } from "./resolvers/barset-generation.resolver";

// ---- CONTROLLERS ----
import { PriceRequestController } from "./controllers/price-request.controller";

// ---- MANAGERS ----
import { AmalgamMakerManager } from "./managers/amalgam-maker.manager";
import { PriceRequestPdfManager } from "./managers/price-request-pdf.manager";
import { PriceRequestAssignationManager } from "./managers/price-request-assignation.manager";
import { WeightCalculatorManager } from "./managers/weight-calculator.manager";
import { PriceCalculatorManager } from "./managers/price-calculator.manager";
import { SmtpConfigModule } from "../smtp-config/smtp-config.module";
import { AuthModule } from "../auth/auth.module";

@Module({
    imports: [
        PassportModule.register({ defaultStrategy: "jwt" }),
        TypeOrmModule.forFeature([
            PriceRequestSql, AmalgamGroupSql, AmalgamSql, AmalgamPartSql, PriceRequestElementSql, SupplierOfferSql, SupplierOfferElementSql, VariantSql,
            PriceRequestAdditionnalCostSql, SupplierOfferAdditionnalCostSql, PriceRequestElementOptionSql, SupplierOfferElementOptionSql, VariantOptionSql,
            BarsetGenerationSql
        ]),
        CommonModule,
        UniqueNumberModule,
        PdfModule,
        MailerModule,
        ElementModule,
        SupplierModule,
        UserModule,
        AuthModule,
        SmtpConfigModule,
        forwardRef(() => ProjectModule)
    ],
    providers: [
        { provide: APP_GUARD, useClass: AccessGuard },
        PriceRequestService,
        PriceRequestLoader,
        PriceRequestResolver,
        AmalgamService,
        AmalgamLoader,
        AmalgamMakerManager,
        AmalgamResolver,
        AmalgamPartService,
        AmalgamPartLoader,
        AmalgamPartByAmalgamLoader,
        AmalgamPartResolver,
        PriceRequestElementService,
        PriceRequestElementResolver,
        AmalgamGroupService,
        PriceRequestElementLoader,
        AmalgamGroupLoader,
        AmalgamByAmalgamGroupLoader,
        PriceRequestElementByPriceRequestLoader,
        AmalgamGroupResolver,
        SupplierOfferService,
        SupplierOfferResolver,
        SupplierOfferLoader,
        SupplierOfferElementResolver,
        SupplierOfferElementService,
        SupplierOfferElementLoader,
        SupplierOfferElementBySupplierOfferLoader,
        TotalPriceBySupplierOfferLoader,
        BestPriceByPriceRequestElementLoader,
        BestTimeByPriceRequestElementLoader,
        SOElementByPossiblePRElementLoader,
        PossiblePRElementBySupplierOfferLoader,
        PossiblePriceRequestElementResolver,
        SupplierOfferByPriceRequestLoader,
        SupplierOfferElementByPriceRequestElementLoader,
        VariantService,
        VariantResolver,
        VariantLoader,
        SupplierOfferAdditionnalCostLoader,
        SupplierOfferAdditionnalCostBySupplierOfferLoader,
        SupplierOfferAdditionnalCostService,
        SupplierOfferAdditionnalCostResolver,
        TotalAdditionnalCostBySupplierOfferLoader,
        PriceRequestPdfManager,
        ParentSupplyCategoryByPriceRequestElementLoader,
        StockQuantityByAmalgamGroupLoader,
        PriceRequestAdditionnalCostLoader,
        PriceRequestAdditionnalCostByPriceRequestLoader,
        PriceRequestAdditionnalCostService,
        PriceRequestAdditionnalCostResolver,
        SupplierOfferACByPriceRequestACLoader,
        PriceRequestElementOptionLoader,
        PREOptionByPriceRequestElementLoader,
        PriceRequestElementOptionService,
        PriceRequestElementOptionResolver,
        SupplierOfferElementOptionLoader,
        SOEOptionByPREOptionLoader,
        SupplierOfferElementOptionService,
        SupplierOfferElementOptionResolver,
        PriceRequestAssignationManager,
        VariantOptionLoader,
        VariantOptionByVariantLoader,
        VariantOptionService,
        VariantOptionResolver,
        WeightCalculatorManager,
        SOEOptionBySupplierOfferElementLoader,
        PriceCalculatorManager,
        PurchaseOrderQuantityByPriceRequestElementLoader,
        PurchaseOrderQuantityByVariantLoader,
        BarsetGenerationResolver,
        BarsetGenerationService,
        BarsetGenerationLoader,
        BarsetGenerationByPriceRequestLoader,
        BestPriceByPriceRequestElementOptionLoader,
        ComputedPriceBySupplierOfferElementLoader,
        HasPriceByPriceRequestElementLoader,
        BestPriceByPriceRequestAdditionnalCostLoader
    ],
    controllers: [
        PriceRequestController
    ],
    exports: [
        PriceRequestService,
        AmalgamService,
        AmalgamGroupService,
        AmalgamPartService,
        PriceRequestElementService,
        PriceRequestAdditionnalCostService,
        SupplierOfferService,
        SupplierOfferElementService,
        SupplierOfferAdditionnalCostService,
        VariantService,
        PriceCalculatorManager,
        PriceRequestAssignationManager,
        WeightCalculatorManager,
        
    ]
})
export class PriceRequestModule { }