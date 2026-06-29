import { Resolver, ResolveField, Parent } from "@nestjs/graphql";
import { UUID } from "../../../core/decorators/uuid.decorator";
import { SupplyListElement } from "../interfaces/supply-list-element.interface";
import { MatterService } from "../../elements/services/matter.service";
import { ElementService } from "../../elements/services/element.service";
import { SupplyListService } from "../services/supply-list.service";
import { SupplyCategoryService } from "../../suppliers/services/supply-category.service";
import { Matter } from "../../elements/interfaces/matter.interface";
import { Element } from "../../elements/interfaces/element.interface";
import { SupplyList } from "../interfaces/supply-list.interface";
import { SupplyCategory } from "../../suppliers/interfaces/supply-category.interface";
import { UseInterceptors } from "@nestjs/common";
import { GqlLoggerInterceptor } from "../../common/interceptors/gql-logger.interceptor";

@Resolver("SupplyListElement")
@UseInterceptors(GqlLoggerInterceptor)
export class SupplyListElementResolver {

    public constructor(
        private readonly _matterSrv: MatterService,
        private readonly _elementSrv: ElementService,
        private readonly _supplyListSrv: SupplyListService,
        private readonly _supplyCategorySrv: SupplyCategoryService
    ) { }

    @ResolveField("matter")
    public async getMatter(@Parent() supplyListElement: SupplyListElement, @UUID() uuid: string): Promise<Matter> {
        return supplyListElement.matterId ? this._matterSrv.getById(supplyListElement.matterId, uuid) : null;
    }

    @ResolveField("element")
    public async getElement(@Parent() supplyListElement: SupplyListElement, @UUID() uuid: string): Promise<Element> {
        return supplyListElement.elementId ? this._elementSrv.getById(supplyListElement.elementId, uuid) : null;
    }

    @ResolveField("supplyList")
    public async getSupplyList(@Parent() supplyListElement: SupplyListElement, @UUID() uuid: string): Promise<SupplyList> {
        return await this._supplyListSrv.getById(supplyListElement.supplyListId, uuid);
    }

    @ResolveField("supplyCategory")
    public async getSupplyCategory(@Parent() supplyListElement: SupplyListElement, @UUID() uuid: string): Promise<SupplyCategory> {
        return supplyListElement.supplyCategoryId ? this._supplyCategorySrv.getById(supplyListElement.supplyCategoryId, uuid) : null;
    }

    @ResolveField("basicQuantityUnit")
    public async getBasicQuantityUnit(@Parent() supplyListElement: SupplyListElement, @UUID() uuid: string): Promise<string> {
        return supplyListElement.quantityUnit;
    }
}