import { Resolver, ResolveField, Parent, Mutation, Args } from "@nestjs/graphql";
import { PurchaseOrderAdditionnalCostService } from "../services/purchase-order-additionnal-cost.service";
import { PurchaseOrderService } from "../services/purchase-order.service";
import { PurchaseOrderAdditionnalCost, PurchaseOrderAdditionnalCostInput, PurchaseOrderAdditionnalCostUpdate } from "../interfaces/purchase-order-additionnal-cost.interface";
import { UUID } from "../../../core/decorators/uuid.decorator";
import { PurchaseOrder } from "../interfaces/purchase-order.interface";
import { UseInterceptors } from "@nestjs/common";
import { GqlLoggerInterceptor } from "../../common/interceptors/gql-logger.interceptor";
import { Access } from "../../../core/decorators/access.decorator";
import { GRANT_TOKEN } from "../../common/jwt/jwt.interface";

@Resolver("PurchaseOrderAdditionnalCost")
@UseInterceptors(GqlLoggerInterceptor)
export class PurchaseOrderAdditionnalCostResolver {

    public constructor(
        private readonly _purchaseOrderAdditionnalCostSrv: PurchaseOrderAdditionnalCostService,
        private readonly _purchaseOrderSrv: PurchaseOrderService
    ) { }

    @Mutation("createPurchaseOrderAdditionnalCost")
    @Access(GRANT_TOKEN.FRONT_ACCESS)
    public async create(@Args("data") data: PurchaseOrderAdditionnalCostInput): Promise<PurchaseOrderAdditionnalCost> {
        return this._purchaseOrderAdditionnalCostSrv.create(data);
    }

    @Mutation("updatePurchaseOrderAdditionnalCost")
    @Access(GRANT_TOKEN.FRONT_ACCESS)
    public async update(@Args("id") id: number, @Args("data") data: PurchaseOrderAdditionnalCostUpdate, @UUID() uuid: string): Promise<PurchaseOrderAdditionnalCost> {
        return this._purchaseOrderAdditionnalCostSrv.update(id, data, uuid);
    }

    @Mutation("deletePurchaseOrderAdditionnalCost")
    @Access(GRANT_TOKEN.FRONT_ACCESS)
    public async delete(@Args("id") id: number): Promise<boolean> {
        return this._purchaseOrderAdditionnalCostSrv.delete(id);
    }

    @ResolveField("purchaseOrder")
    public async getPurchaseOrder(@Parent() poac: PurchaseOrderAdditionnalCost, @UUID() uuid: string): Promise<PurchaseOrder> {
        return poac.purchaseOrderId ? this._purchaseOrderSrv.getById(poac.purchaseOrderId, uuid) : null;
    }
}