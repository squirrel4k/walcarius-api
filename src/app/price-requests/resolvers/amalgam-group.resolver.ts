import { Resolver, ResolveField, Parent } from "@nestjs/graphql";
import { AmalgamGroup } from "../interfaces/amalgam-group.interface";
import { UUID } from "../../../core/decorators/uuid.decorator";
import { UseInterceptors } from "@nestjs/common";
import { GqlLoggerInterceptor } from "../../common/interceptors/gql-logger.interceptor";
import { Matter } from "../../elements/interfaces/matter.interface";
import { MatterService } from "../../elements/services/matter.service";
import { SupplyCategory } from "../../suppliers/interfaces/supply-category.interface";
import { SupplyCategoryService } from "../../suppliers/services/supply-category.service";
import { ElementService } from "../../elements/services/element.service";
import { Element } from "../../elements/interfaces/element.interface";
import { Amalgam } from "../interfaces/amalgam.interface";
import { AmalgamService } from "../services/amalgam.service";

@Resolver("AmalgamGroup")
@UseInterceptors(GqlLoggerInterceptor)
export class AmalgamGroupResolver {

    public constructor (
        private readonly _matterSrv: MatterService,
        private readonly _supplyCategorySrv: SupplyCategoryService,
        private readonly _elementSrv: ElementService,
        private readonly _amalgamSrv: AmalgamService
    ) { }

    @ResolveField("matter")
    public async getMatter(@Parent() amalgamGroup: AmalgamGroup, @UUID() uuid: string): Promise<Matter> {
        return amalgamGroup.matterId ? this._matterSrv.getById(amalgamGroup.matterId, uuid) : null;
    }

    @ResolveField("supplyCategory")
    public async getSupplyCategory(@Parent() amalgamGroup: AmalgamGroup, @UUID() uuid: string): Promise<SupplyCategory> {
        return amalgamGroup.supplyCategoryId ? this._supplyCategorySrv.getById(amalgamGroup.supplyCategoryId, uuid) : null;
    }

    @ResolveField("element")
    public async getElement(@Parent() amalgamGroup: AmalgamGroup, @UUID() uuid: string): Promise<Element> {
        return amalgamGroup.elementId ? this._elementSrv.getById(amalgamGroup.elementId, uuid) : null;
    }

    @ResolveField("amalgams")
    public async getAmalgams(@Parent() amalgamGroup: AmalgamGroup, @UUID() uuid: string): Promise<Amalgam[]> {
        return this._amalgamSrv.getListByAmalgamGroup(amalgamGroup.id, uuid);
    }
}