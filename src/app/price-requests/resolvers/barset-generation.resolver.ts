import { Resolver, ResolveField, Parent } from "@nestjs/graphql";
import { PriceRequestService } from "../services/price-request.service";
import { BarsetGeneration } from "../interfaces/barset-generation.interface";
import { UUID } from "../../../core/decorators/uuid.decorator";
import { PriceRequest } from "../interfaces/price-request.interface";
import { UseInterceptors } from "@nestjs/common";
import { GqlLoggerInterceptor } from "../../common/interceptors/gql-logger.interceptor";

@Resolver("BarsetGeneration")
@UseInterceptors(GqlLoggerInterceptor)
export class BarsetGenerationResolver {

    public constructor(
        private readonly _priceRequestSrv: PriceRequestService
    ) { }

    @ResolveField("priceRequest")
    public async getPriceRequest(@Parent() generation: BarsetGeneration, @UUID() uuid: string): Promise<PriceRequest> {
        return generation.priceRequestId ? this._priceRequestSrv.getById(generation.priceRequestId, uuid) : null;
    }
}