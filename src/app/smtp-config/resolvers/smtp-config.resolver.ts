import { Resolver, Query, Args, Mutation } from "@nestjs/graphql";
import { Injectable, UseInterceptors } from "@nestjs/common";
import { SmtpConfigService } from "../services/smtp-config.service";
import { GqlLoggerInterceptor } from "../../common/interceptors/gql-logger.interceptor";
import { Access } from "../../../core/decorators/access.decorator";
import { GRANT_TOKEN } from "../../common/jwt/jwt.interface";
import { SmtpConfig, SmtpConfigInput, UpdateSmtpConfig } from "../interfaces/smtp-config.interface";
import { DataSource } from "typeorm";
import { ErrorUtil } from "../../../core/utils/error.util";
import { Observable } from "rxjs";


@Resolver("SmtpConfig")
@UseInterceptors(GqlLoggerInterceptor)
export class SmtpConfigResolver {

    public constructor(
        private readonly _smtpSrv: SmtpConfigService
    ) { }

    /**
    * @description get SmtpConfig where loginId=id user
    * @author Marie Claudia
    * @param {number} id
    * @returns {Promise<SmtpConfig>}
    * @memberof SmtpConfigResolver
    */

    @Query("getSmtpConfig")
    @Access(GRANT_TOKEN.FRONT_ACCESS)
    public async getSmtpConfig(@Args("id") id: number): Promise<SmtpConfig> {
        return await this._smtpSrv.findByProperty({loginId : id});
    }

  
    /**
    * @description update SmptConfig from database by its id
    * @author Marie Claudia
    * @param {number} id
    * @param {UpdateSmtpConfig} smtp
    * @returns {Promise<SmtpConfig>}
    * @memberof SmtpConfigResolver
    */
    @Mutation("updateSmtpConfig")
    @Access(GRANT_TOKEN.FRONT_ACCESS)
    public async updateSmtpConfig(@Args("smtp") smtp: UpdateSmtpConfig, @Args("id") id: number
    ): Promise<SmtpConfig> {  
        return await this._smtpSrv.updateSmtpConfig(smtp,id);
    }
}