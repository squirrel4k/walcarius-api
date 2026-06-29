import { Resolver, ResolveField, Parent } from "@nestjs/graphql";
import { PurchaseOrderElementOptionService } from "../services/purchase-order-element-option.service";
import { PurchaseOrderElementService } from "../services/purchase-order-element.service";
import { PurchaseOrderElementOption } from "../interfaces/purchase-order-element-option.interface";
import { UUID } from "../../../core/decorators/uuid.decorator";
import { PurchaseOrderElement } from "../interfaces/purchase-order-element.interface";
import { UseInterceptors } from "@nestjs/common";
import { GqlLoggerInterceptor } from "../../common/interceptors/gql-logger.interceptor";

@Resolver("PurchaseOrderElementOption")
@UseInterceptors(GqlLoggerInterceptor)
export class PurchaseOrderElementOptionResolver {

    public constructor(
        private readonly _purchaseOrderElementOptionSrv: PurchaseOrderElementOptionService,
        private readonly _purchaseOrderElementSrv: PurchaseOrderElementService
    ) { }

    @ResolveField("purchaseOrderElement")
    public async getPurchaseOrderElement(@Parent() option: PurchaseOrderElementOption, @UUID() uuid: string): Promise<PurchaseOrderElement> {
        return option.purchaseOrderElementId ? this._purchaseOrderElementSrv.getById(option.purchaseOrderElementId, uuid) : null;
    }
}