import { Resolver, Query, Args, Parent, ResolveProperty } from "@nestjs/graphql";
import { AmalgamService } from "../services/amalgam.service";
import { AmalgamParam, AmalgamFilter, Amalgam, AmalgamGenerationResult } from "../interfaces/amalgam.interface";
import { UseInterceptors } from "@nestjs/common";
import { GqlLoggerInterceptor } from "../../common/interceptors/gql-logger.interceptor";
import { Access } from "../../../core/decorators/access.decorator";
import { GRANT_TOKEN } from "../../common/jwt/jwt.interface";
import { AmalgamMakerManager } from "../managers/amalgam-maker.manager";
import { AmalgamPart } from "../interfaces/amalgam-part.interface";
import { AmalgamPartService } from "../services/amalgam-part.service";
import { UUID } from "../../../core/decorators/uuid.decorator";
import { AmalgamGroup } from "../interfaces/amalgam-group.interface";
import { AmalgamGroupService } from "../services/amalgam-group.service";
import { getConnection } from "typeorm";
import { ErrorUtil } from "../../../core/utils/error.util";

@Resolver("Amalgam")
@UseInterceptors(GqlLoggerInterceptor)
export class AmalgamResolver {

    public constructor(
        private readonly _amalgamMakerMgr: AmalgamMakerManager,
        private readonly _amalgamSrv: AmalgamService,
        private readonly _amalgamPartSrv: AmalgamPartService,
        private readonly _amalgamGroupSrv: AmalgamGroupService
    ) { }

    @Query("amalgams")
    @Access(GRANT_TOKEN.FRONT_ACCESS)
    public async getList(@Args("filter") filter: AmalgamFilter): Promise<Amalgam[]> {
        return this._amalgamSrv.list(filter);
    }

    @Query("generateAmalgams")
    @Access(GRANT_TOKEN.FRONT_ACCESS)
    public async generateAmalgams(
        @Args("priceRequestId") priceRequestId: number,
        @Args("params") params: AmalgamParam,
        @Args("locked") lockedAmalgams: any[]
    ): Promise<AmalgamGenerationResult> {
        // Force conversion of all given IDs into numbers since GraphQL converts them in string
        if (lockedAmalgams && lockedAmalgams.length > 0) {
            lockedAmalgams.forEach(locked => locked.parts.forEach(part => part.supplyListElementId = parseInt(part.supplyListElementId, 10)));
        }

        return await getConnection().transaction(async transaction => {
            const generationResult = await this._amalgamMakerMgr.genAmalgams(priceRequestId, params, lockedAmalgams, transaction);
            const amalgamGroups = this._amalgamGroupSrv.generateGroups([...generationResult.amalgams]);

            return {
                amalgams: await this._amalgamGroupSrv.assignGroups(generationResult.amalgams, amalgamGroups),
                barsetGeneration: generationResult.generation
            };
        }).catch(err => { throw ErrorUtil.get(err); });
    }

    @ResolveProperty("amalgamGroup")
    public async getAmalgamGroup(@Parent() amalgam: Amalgam, @UUID() uuid: string): Promise<AmalgamGroup> {
        return amalgam.amalgamGroup ?
            amalgam.amalgamGroup :
            amalgam.amalgamGroupId ? this._amalgamGroupSrv.getById(amalgam.amalgamGroupId, uuid) : null;
    }

    @ResolveProperty("parts")
    public async getAmalgamParts(@Parent() amalgam: Amalgam, @UUID() uuid: string): Promise<AmalgamPart[]> {
        return amalgam.parts ? amalgam.parts : this._amalgamPartSrv.getByAmalgam(amalgam.id, uuid);
    }
}