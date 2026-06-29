import { Resolver, Query, Args, ResolveField, Parent } from "@nestjs/graphql";
import { ActionGroupService } from "../services/action-group.service";
import { ActionGroup } from "../interfaces/action-group.interface";
import { Nature } from "../interfaces/nature.interface";
import { NatureService } from "../services/nature.service";
import { Matter } from "../interfaces/matter.interface";
import { MatterService } from "../services/matter.service";
import { Action } from "../interfaces/action.interface";
import { ActionService } from "../services/action.service";
import { UseInterceptors } from "@nestjs/common";
import { GqlLoggerInterceptor } from "../../common/interceptors/gql-logger.interceptor";
import { Access } from "../../../core/decorators/access.decorator";
import { GRANT_TOKEN } from "../../common/jwt/jwt.interface";
import { UUID } from "../../../core/decorators/uuid.decorator";

@Resolver("ActionGroup")
@UseInterceptors(GqlLoggerInterceptor)
export class ActionGroupResolver {

    public constructor (
        private readonly _actionGroupSrv: ActionGroupService,
        private readonly _actionSrv: ActionService,
        private readonly _natureSrv: NatureService,
        private readonly _matterSrv: MatterService,
    ) { }

    @Query("getActionGroupById")
    @Access(GRANT_TOKEN.FRONT_ACCESS)
    public async getActionGroupById(@Args("actionGroupId") id: number, @UUID() uuid: string): Promise<ActionGroup> {
        return this._actionGroupSrv.getById(id, uuid);
    }

    @ResolveField("actions")
    public async getActionsFromGroup(@Parent() actionGroup: ActionGroup, @UUID() uuid: string): Promise<Action[]> {
        return this._actionSrv.getActionByActionGroup(actionGroup.id, uuid);
    }

    @ResolveField("parameters")
    public async getParametersForActionGroup(@Parent() actionGroup: ActionGroup, @UUID() uuid: string): Promise<Nature[]> {
        return this._natureSrv.getNaturesByActionGroup(actionGroup.id, uuid);
    }

    @ResolveField("availableMatters")
    public async getAvailableMatters(@Parent() actionGroup: ActionGroup, @UUID() uuid: string): Promise<Matter[]> {
        // return this._matterSrv.getMattersForActionGroup(actionGroup.id);
        return this._matterSrv.getMattersByActionGroup(actionGroup.id, uuid);
    }
}