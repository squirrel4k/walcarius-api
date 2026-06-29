import { GqlContext } from "../../../core/interfaces/gql-context.interface";
import { Resolver, Mutation, Args, ResolveField, Query, Parent, Context } from "@nestjs/graphql";
import { QuoteService } from "../services/quote.service";
import { Usr } from "../../../core/decorators/user.decorator";
import { User } from "../../users/interfaces/user.interface";
import { Pagination } from "../../../core/interfaces/crud.interface";
import { Quote, SortQuote, UpdateQuote, InputQuote, DisplayQuote } from "../interfaces/quote.interface";
import { BadRequestException, Request, UseInterceptors } from "@nestjs/common"
import { GqlLoggerInterceptor } from "../../common/interceptors/gql-logger.interceptor";
import { Access } from "../../../core/decorators/access.decorator";
import { GRANT_TOKEN } from "../../common/jwt/jwt.interface";
import { UniqueNumberService } from "../../uniquenumber/uniquenumber.service";
import { NUMBER_TYPE } from "../../uniquenumber/uniquenumber.interface";
import { QuoteProjectService } from "../services/quote-project.service";
import { UUID } from "../../../core/decorators/uuid.decorator";
import { QuoteProject } from "../interfaces/quote-project.interface";
import { AuthService } from "../../auth/auth.service";
import { PERMISSION_CATEGORIES } from "../../users/enums/permissioncategories.enum";
import { PERMISSION_TYPES } from "../../users/enums/permissiontypes.enum";
import { ERROR_MESSAGE } from "../../../core/errors/enum/error.enum";

@Resolver("Quote")
@UseInterceptors(GqlLoggerInterceptor)
export class QuoteResolver {

    public constructor (
        private readonly _quoteSrv: QuoteService,
        private readonly _quoteProjectSrv: QuoteProjectService,
        private readonly _uniqueSrv: UniqueNumberService,
        private readonly _authSrv : AuthService
    ) { }

    @Query("getQuoteNumber")
    @Access(GRANT_TOKEN.FRONT_ACCESS)
    public async getNumber(@Usr() user: User): Promise<string> {
        const search = this._uniqueSrv.getLastNumberSearchPattern(NUMBER_TYPE.QUOTE);
        const lastNumber = await this._quoteSrv.getLastQuoteNumber(search);

        return this._uniqueSrv.getNumber(NUMBER_TYPE.QUOTE, user, lastNumber);
    }

    @Query("quotes")
    @Access(GRANT_TOKEN.FRONT_ACCESS)
    public async getQuotes(
        @Args("pagination") pagination: Pagination,
        @Args("sort") sort: SortQuote,
        @Args("search") search: string,
        @UUID() uuid: string
    ): Promise<Quote[]> {
        if (!pagination) { pagination = { limit: 10, page: 1 }; }

        return this._quoteSrv.list(pagination, sort, search, uuid);
    }

    @Query("displayQuotes")
    @Access(GRANT_TOKEN.FRONT_ACCESS)
    public async getDisplayQuotes(
        @Args("pagination") pagination: Pagination,
        @Args("sort") sort: SortQuote,
        @Args("search") search: string
    ): Promise<DisplayQuote[]> {
        return this._quoteSrv.displayedList(pagination, sort, search);
    }

    @Query("quote")
    @Access(GRANT_TOKEN.FRONT_ACCESS)
    public async getQuote(@Args("_id") _id: string, @UUID() uuid: string): Promise<Quote> {
        return this._quoteSrv.getById(_id, uuid);
    }

    @Mutation("freeQuoteNumber")
    @Access(GRANT_TOKEN.FRONT_ACCESS)
    public async freeNumber(@Usr() user: User): Promise<boolean> {
        return this._uniqueSrv.freeNumber(NUMBER_TYPE.QUOTE, user);
    }

    @Mutation("createQuote")
    @Access(GRANT_TOKEN.FRONT_ACCESS)
    public async createQuote(@Args("quote") quote: InputQuote, @Usr() user: User ): Promise<Quote> {
        const newQuote = await this._quoteSrv.create(quote);
        await this._uniqueSrv.freeNumber(NUMBER_TYPE.QUOTE, user);

        return newQuote;
    }

    @Mutation("updateQuote")
    @Access(GRANT_TOKEN.FRONT_ACCESS)
    public async updateQuote(@Args("quote") quote: UpdateQuote, @Args("_id") _id: string, @Context() ctx: GqlContext
    ): Promise<Quote> {
        let updatepermisssion = this._authSrv.authorized(ctx.req.user.userGroup,PERMISSION_CATEGORIES.QUOTATIONS,PERMISSION_TYPES.WRITE);
        if(updatepermisssion){
            return this._quoteSrv.update(quote, _id);
        }else{
            throw new BadRequestException(ERROR_MESSAGE.FORBIDDEN);
        }
    }

    @Mutation("deleteQuote")
    @Access(GRANT_TOKEN.FRONT_ACCESS)
    public async deleteQuote(@Args("_id") _id: string, @Context() ctx: GqlContext): Promise<boolean> {
         //check permission delete quotation
         let deletepermisssion = this._authSrv.authorized(ctx.req.user.userGroup,PERMISSION_CATEGORIES.QUOTATIONS,PERMISSION_TYPES.DELETE);
         if(deletepermisssion){
             return this._quoteSrv.delete(_id);
         }else{
             throw new BadRequestException(ERROR_MESSAGE.FORBIDDEN);
         }
    }

    @Mutation("duplicateQuote")
    @Access(GRANT_TOKEN.FRONT_ACCESS)
    public async duplicateQuote(@Usr() user: User, @Args("_id") _id: string, @UUID() uuid: string): Promise<Quote> {
        const search = this._uniqueSrv.getLastNumberSearchPattern(NUMBER_TYPE.QUOTE);
        const lastNumber = await this._quoteSrv.getLastQuoteNumber(search);
        const newNumber = await this._uniqueSrv.getNumber(NUMBER_TYPE.QUOTE, user, lastNumber);

        return this._quoteSrv.duplicate(_id, newNumber, uuid);
    }

    @ResolveField("project")
    public async projectResolve(@Parent() quote: Quote, @UUID() uuid: string): Promise<QuoteProject> {
        return this._quoteProjectSrv.getById(quote.projectId, uuid);
    }
}