import { GqlContext } from "../../../core/interfaces/gql-context.interface";
import { Resolver, Query, Args, Mutation, ResolveField, Parent, Context } from "@nestjs/graphql";
import { SortQuoteProject, QuoteProject, InputQuoteProject, UpdateQuoteProject } from "../interfaces/quote-project.interface";
import { Pagination } from "../../../core/interfaces/crud.interface";
import { ERROR_MESSAGE } from "../../../core/errors/enum/error.enum";
import { BadRequestException, Req, Request, UseGuards, UseInterceptors } from "@nestjs/common"
import { QuoteService } from "../services/quote.service";
import { Quote, DisplayQuote } from "../interfaces/quote.interface";
import { GqlLoggerInterceptor } from "../../common/interceptors/gql-logger.interceptor";
import { Access } from "../../../core/decorators/access.decorator";
import { GRANT_TOKEN } from "../../common/jwt/jwt.interface";
import { QuoteProjectService } from "../services/quote-project.service";
import { UUID } from "../../../core/decorators/uuid.decorator";
import { PERMISSION_CATEGORIES } from "../../users/enums/permissioncategories.enum";
import { PERMISSION_TYPES } from "../../users/enums/permissiontypes.enum";
import { AuthService } from "../../auth/auth.service";

@Resolver("QuoteProject")
@UseInterceptors(GqlLoggerInterceptor)
export class QuoteProjectResolver {

    public constructor (
        private readonly _quoteProjectSrv: QuoteProjectService,
        private readonly _quoteSrv: QuoteService,
        private readonly _authSrv : AuthService
    ) { }

    @Query("quoteProjects")
    @Access(GRANT_TOKEN.FRONT_ACCESS)
    public async getQuoteProjects(
        @Args("pagination") pagination: Pagination,
        @Args("sort") sort: SortQuoteProject,
        @Args("search") search: string,
        @Context() ctx: GqlContext
    ): Promise<QuoteProject[]> {
        //check permission read list quotation
        let readpermisssion = this._authSrv.authorized(ctx.req.user.userGroup,PERMISSION_CATEGORIES.QUOTATIONS,PERMISSION_TYPES.READ);
        if(readpermisssion){
            return this._quoteProjectSrv.list(pagination, sort, search);
        }else{
            throw new BadRequestException(ERROR_MESSAGE.FORBIDDEN);
        }
    }

    @Query("quoteProject")
    @Access(GRANT_TOKEN.FRONT_ACCESS)
    public async getQuoteProject(@Args("_id") id: string, @UUID() uuid: string): Promise<QuoteProject> {
        return this._quoteProjectSrv.getById(id, uuid);
    }

    @Query("isQuoteProjectDeletable")
    @Access(GRANT_TOKEN.FRONT_ACCESS)
    public async isQuoteProjectDeletable(@Args("_id") id: string, @UUID() uuid: string): Promise<boolean> {
        const linkedQuotes = await this._quoteSrv.getQuotesOfProject(id, uuid);
        return linkedQuotes.length == 0;
    }

    @Mutation("createQuoteProject")
    @Access(GRANT_TOKEN.FRONT_ACCESS)
    public async createQuoteProject(@Args("project") project: InputQuoteProject): Promise<QuoteProject> {
        return this._quoteProjectSrv.create(project);
    }

    @Mutation("updateQuoteProject")
    @Access(GRANT_TOKEN.FRONT_ACCESS)
    public async updateQuoteProject(@Args("project") project: UpdateQuoteProject, @Args("_id") id: string, @Context() ctx: GqlContext): Promise<QuoteProject> {
        let updatepermisssion = this._authSrv.authorized(ctx.req.user.userGroup,PERMISSION_CATEGORIES.QUOTATIONS,PERMISSION_TYPES.WRITE);
        if(updatepermisssion){
            return this._quoteProjectSrv.update(project, id);
        }else{
            throw new BadRequestException(ERROR_MESSAGE.FORBIDDEN);
        }    
    }

    @Mutation("deleteQuoteProject")
    @Access(GRANT_TOKEN.FRONT_ACCESS)
    public async deleteQuoteProject(@Args("_id") _id: string, @UUID() uuid: string, @Context() ctx: GqlContext): Promise<boolean> {
        const quotes = await this._quoteSrv.getQuotesOfProject(_id, uuid);
        //check permission delete quotation
        let deletepermisssion = this._authSrv.authorized(ctx.req.user.userGroup,PERMISSION_CATEGORIES.QUOTATIONS,PERMISSION_TYPES.DELETE);
        if(deletepermisssion){
            if (quotes.length == 0) {
                    return this._quoteProjectSrv.delete(_id);
            } else {
                throw new BadRequestException(ERROR_MESSAGE.QUOTE_PROJECT_NOT_EMPTY);
            }
        }else{
            throw new BadRequestException(ERROR_MESSAGE.FORBIDDEN);
        }
    }

    @ResolveField("quotes")
    public async quotesResolver(@Parent() project: QuoteProject, @UUID() uuid: string): Promise<Quote[]> {
        return this._quoteSrv.getQuotesOfProject(project._id, uuid);
    }

    @ResolveField("displayQuotes")
    public async getSimpleQuotes(@Parent() project: QuoteProject, @UUID() uuid: string): Promise<DisplayQuote[]> {
        return this._quoteSrv.getDisplayQuotesByProject(project._id, uuid);
    }

    @ResolveField("quoteIds")
    public async getQuoteIds(@Parent() project: QuoteProject, @UUID() uuid: string): Promise<string[]> {
        return (await this._quoteSrv.getQuotesOfProject(project._id, uuid)).map(quote => quote._id);
    }
}