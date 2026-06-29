import { Resolver, Query, Args } from "@nestjs/graphql";
import { Matter } from "../interfaces/matter.interface";
import { MatterService } from "../services/matter.service";
import { UseInterceptors } from "@nestjs/common";
import { GqlLoggerInterceptor } from "../../common/interceptors/gql-logger.interceptor";
import { Access } from "../../../core/decorators/access.decorator";
import { GRANT_TOKEN } from "../../common/jwt/jwt.interface";

@Resolver("Matter")
@UseInterceptors(GqlLoggerInterceptor)
export class MatterResolver {

    public constructor (
        private readonly _matterSrv: MatterService
    ) { }

    @Query("availableMatters")
    @Access(GRANT_TOKEN.FRONT_ACCESS)
    public async getAvailableMatters(@Args("forCustom") forCustom: boolean): Promise<Matter[]> {
        return this._matterSrv.matterList(forCustom);
    }
}