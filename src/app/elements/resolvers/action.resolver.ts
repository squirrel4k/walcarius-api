import { Resolver, Query, Args, ResolveField, Parent } from "@nestjs/graphql";
import { ActionService } from "../services/action.service";
import { ActionGroupService } from "../services/action-group.service";
import { MatterService } from "../services/matter.service";
import { ActionGroup } from "../interfaces/action-group.interface";
import { Matter } from "../interfaces/matter.interface";
import { Action, FilterAction } from "../interfaces/action.interface";
import { UseInterceptors } from "@nestjs/common";
import { GqlLoggerInterceptor } from "../../common/interceptors/gql-logger.interceptor";
import { Access } from "../../../core/decorators/access.decorator";
import { GRANT_TOKEN } from "../../common/jwt/jwt.interface";
import { UUID } from "../../../core/decorators/uuid.decorator";

@Resolver("Action")
@UseInterceptors(GqlLoggerInterceptor)
export class ActionResolver {

    public constructor (
        private readonly _actionSrv: ActionService,
        private readonly _actionGroupSrv: ActionGroupService,
        private readonly _matterSrv: MatterService
    ) { }

    @Query("searchAction")
    @Access(GRANT_TOKEN.FRONT_ACCESS)
    public async searchAction(@Args("actionGroupId") actionGroupId: number, @Args("search") search: string): Promise<Action[]> {
        return this._actionSrv.searchAction(search, actionGroupId);
    }

    @Query("getActionByParameters")
    @Access(GRANT_TOKEN.FRONT_ACCESS)
    public async getActionByParameters(@Args("actionGroupId") actionGroupId: number, @Args("params") params: FilterAction): Promise<Action> {
        return this._actionSrv.getActionByParameters(actionGroupId, params);
    }

    @Query("getActionByThickness")
    @Access(GRANT_TOKEN.FRONT_ACCESS)
    public async getActionByThickness(@Args("actionGroupId") actionGroupId: number, @Args("params") params: FilterAction): Promise<Action> {
        return this._actionSrv.getActionByThickness(actionGroupId, params);
    }

    @ResolveField("actionGroup")
    public async getActionGroup(@Parent() action: Action, @UUID() uuid: string): Promise<ActionGroup> {
        return action.actionGroupId ? await this._actionGroupSrv.getById(action.actionGroupId, uuid) : null;
    }

    @ResolveField("matter")
    public async getMatter(@Parent() action: Action, @UUID() uuid: string): Promise<Matter> {
        return action.matterId ? await this._matterSrv.getById(action.matterId, uuid) : null;
    }
}