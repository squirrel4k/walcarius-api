import { Resolver, ResolveProperty, Parent } from "@nestjs/graphql";
import { AmalgamService } from "../services/amalgam.service";
import { AmalgamPart } from "../interfaces/amalgam-part.interface";
import { UUID } from "../../../core/decorators/uuid.decorator";
import { Amalgam } from "../interfaces/amalgam.interface";
import { SupplyListElementService } from "../../projects/services/supply-list-element.service";
import { SupplyListElement } from "../../projects/interfaces/supply-list-element.interface";
import { UseInterceptors } from "@nestjs/common";
import { GqlLoggerInterceptor } from "../../common/interceptors/gql-logger.interceptor";

@Resolver("AmalgamPart")
@UseInterceptors(GqlLoggerInterceptor)
export class AmalgamPartResolver {

    public constructor (
        private readonly _amalgamSrv: AmalgamService,
        private readonly _supplyListElementSrv: SupplyListElementService
    ) { }

    @ResolveProperty("amalgam")
    public async getAmalgam(@Parent() part: AmalgamPart, @UUID() uuid: string): Promise<Amalgam> {
        return this._amalgamSrv.getById(part.amalgamId, uuid);
    }

    @ResolveProperty("supplyListElement")
    public async getSupplyListElement(@Parent() part: AmalgamPart, @UUID() uuid: string): Promise<SupplyListElement> {
        return this._supplyListElementSrv.getById(part.supplyListElementId, uuid);
    }
}