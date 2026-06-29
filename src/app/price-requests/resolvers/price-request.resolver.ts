import { Resolver, Query, Args, Mutation, Parent, ResolveProperty, Context } from "@nestjs/graphql";
import { PriceRequest, PriceRequestInput, PriceRequestUpdate, PriceRequestFilter, PriceRequestSort } from "../interfaces/price-request.interface";
import { UseInterceptors, InternalServerErrorException, BadRequestException } from "@nestjs/common";
import { GqlLoggerInterceptor } from "../../common/interceptors/gql-logger.interceptor";
import { Access } from "../../../core/decorators/access.decorator";
import { GRANT_TOKEN } from "../../common/jwt/jwt.interface";
import { PriceRequestService } from "../services/price-request.service";
import { Usr } from "../../../core/decorators/user.decorator";
import { User } from "../../users/interfaces/user.interface";
import { UniqueNumberService } from "../../uniquenumber/uniquenumber.service";
import { NUMBER_TYPE } from "../../uniquenumber/uniquenumber.interface";
import { SupplyListService } from "../../projects/services/supply-list.service";
import { UUID } from "../../../core/decorators/uuid.decorator";
import { SupplyList } from "../../projects/interfaces/supply-list.interface";
import { AmalgamService } from "../services/amalgam.service";
import { WinstonLogger } from "../../common/logger/winston.logger";
import { PriceRequestElementService } from "../services/price-request-element.service";
import { ERROR_MESSAGE } from "../../../core/errors/enum/error.enum";
import { getConnection } from "typeorm";
import { PriceRequestElement } from "../interfaces/price-request-element.interface";
import { AmalgamInput, Amalgam } from "../interfaces/amalgam.interface";
import { SupplierOfferService } from "../services/supplier-offer.service";
import { SupplierOffer } from "../interfaces/supplier-offer.interface";
import { UserService } from "../../users/services/user.service";
import { PriceRequestAdditionnalCost } from "../interfaces/price-request-additionnal-cost.interface";
import { PriceRequestAdditionnalCostService } from "../services/price-request-additionnal-cost.service";
import { PriceRequestAssignationManager } from "../managers/price-request-assignation.manager";
import { ErrorUtil } from "../../../core/utils/error.util";
import { BarsetGeneration, GqlBarsetGenerationUpdate } from "../interfaces/barset-generation.interface";
import { BarsetGenerationService } from "../services/barset-generation.service";
import { ProjectService } from "../../projects/services/project.service";
import { Project } from "../../projects/interfaces/project.interface";
import { Pagination } from "../../../core/interfaces/crud.interface";
import { PERMISSION_CATEGORIES } from "../../users/enums/permissioncategories.enum";
import { PERMISSION_TYPES } from "../../users/enums/permissiontypes.enum";
import { AuthService } from "../../auth/auth.service";

@Resolver("PriceRequest")
@UseInterceptors(GqlLoggerInterceptor)
export class PriceRequestResolver {

    public constructor (
        private readonly _priceRequestSrv: PriceRequestService,
        private readonly _uniqueSrv: UniqueNumberService,
        private readonly _supplyListSrv: SupplyListService,
        private readonly _amalgamSrv: AmalgamService,
        private readonly _priceRequestElementSrv: PriceRequestElementService,
        private readonly _supplierOfferSrv: SupplierOfferService,
        private readonly _priceRequestAssignationMgr: PriceRequestAssignationManager,
        private readonly _userSrv: UserService,
        private readonly _priceRequestAdditionnalCostSrv: PriceRequestAdditionnalCostService,
        private readonly _barsetGenerationSrv: BarsetGenerationService,
        private readonly _projectSrv: ProjectService,
        private readonly _logger: WinstonLogger,
        private readonly _authSrv : AuthService
    ) { }

    @Query("priceRequests")
    @Access(GRANT_TOKEN.FRONT_ACCESS)
    public async getPriceRequests(
        @Args("filter") filter: PriceRequestFilter,
        @Args("sort") sort: PriceRequestSort,
        @Args("pagination") pagination: Pagination,
        @Context() ctx: any
    ): Promise<PriceRequest[]> {
        const result = await this._priceRequestSrv.frontList(filter, sort, pagination);
        ctx.pagination = result.pagination;
          //check permission read list price requests
        let readpermisssion = this._authSrv.authorized(ctx.req.user.userGroup,PERMISSION_CATEGORIES.PRICE_REQUESTS,PERMISSION_TYPES.READ);
        if(readpermisssion){
            return result.data;
        }else{
            throw new BadRequestException(ERROR_MESSAGE.FORBIDDEN);
        }
    }

    @Query("priceRequest")
    @Access(GRANT_TOKEN.FRONT_ACCESS)
    public async getPriceRequest(@Args("id") id: number, @UUID() uuid: string): Promise<PriceRequest> {
        return await this._priceRequestSrv.getById(id, uuid);
    }

    @Query("getPriceRequestReference")
    @Access(GRANT_TOKEN.FRONT_ACCESS)
    public async getNumber(@Usr() user: User): Promise<string> {
        const search: string = this._uniqueSrv.getLastNumberSearchPattern(NUMBER_TYPE.PRICE_REQUEST);
        const lastNumber: string = await this._priceRequestSrv.getLastPriceRequestReference(search);

        return this._uniqueSrv.getNumber(NUMBER_TYPE.PRICE_REQUEST, user, lastNumber);
    }

    @Mutation("createPriceRequest")
    @Access(GRANT_TOKEN.FRONT_ACCESS)
    public async createPriceRequest(@Args("data") data: PriceRequestInput, @Usr() user: User, @UUID() uuid: string): Promise<PriceRequest> {
        return await getConnection().transaction(async manager => {
            data.reference = await this.getNumber(user);
            const priceRequest = await this._priceRequestSrv.createOne(data, user.id, manager);
            await this._uniqueSrv.freeNumber(NUMBER_TYPE.PRICE_REQUEST, user);

            // Create base BarsetGeneration
            await this._barsetGenerationSrv.create({ priceRequestId: priceRequest.id }, manager);

            // Assign SupplyList to the created PriceRequest if given
            if (data.supplyListIds && data.supplyListIds.length > 0) {
                const done = await this._priceRequestAssignationMgr.assignSupplyList(priceRequest, data.supplyListIds, manager, uuid);
            }

            // Create base Additionnal Costs for the PriceRequest
            priceRequest.additionnalCosts = await this._priceRequestAdditionnalCostSrv.createForNewPriceRequest(priceRequest.id, manager);

            return priceRequest;
        }).catch(err => { throw ErrorUtil.get(err); });
    }

    @Mutation("createPriceRequestBySupplyList")
    @Access(GRANT_TOKEN.FRONT_ACCESS)
    public async createBySupplyList(@Args("supplyListId") supplyListId: number, @Usr() user: User, @UUID() uuid: string): Promise<PriceRequest> {
        // Get last number
        const reference = await this.getNumber(user);

        return await getConnection().transaction(async manager => {
            // Create PriceRequest & free number afterwards
            const priceRequest = await this._priceRequestSrv.createOne({ reference }, user.id, manager);
            await this._uniqueSrv.freeNumber(NUMBER_TYPE.PRICE_REQUEST, user);

            // Create base BarsetGeneration
            await this._barsetGenerationSrv.create({ priceRequestId: priceRequest.id }, manager);

            // Assign SupplyList to the created PriceRequest
            const done = await this._priceRequestAssignationMgr.assignSupplyList(priceRequest, [supplyListId], manager, uuid);

            // Create base Additionnal Costs for the PriceRequest
            priceRequest.additionnalCosts = await this._priceRequestAdditionnalCostSrv.createForNewPriceRequest(priceRequest.id, manager);

            return priceRequest;
        }).catch(err => {
            this._uniqueSrv.freeNumber(NUMBER_TYPE.PRICE_REQUEST, user);
            throw ErrorUtil.get(err);
        });
    }

    @Mutation("deletePriceRequest")
    @Access(GRANT_TOKEN.FRONT_ACCESS)
    public async deletePriceRequest(@Args("id") id: number, @Context() ctx: any): Promise<boolean> {
        if (!(await this._priceRequestAssignationMgr.isPriceRequestEditable(id))) { return false; }

        //check permission delete price requests
        let deletepermisssion = this._authSrv.authorized(ctx.req.user.userGroup,PERMISSION_CATEGORIES.PRICE_REQUESTS,PERMISSION_TYPES.DELETE);
        if(deletepermisssion){
            return await getConnection().transaction(async manager => {
                // Free related SupplyList
                const supplyListFreed = await this._supplyListSrv.forceFreeFromPriceRequest(id, manager);
                if (!supplyListFreed) { this._logger.warn(`Couldn't free SupplyLists for priceRequest [${id}].`); }
    
                // Delete related SupplierOffers
                const offersDeleted = await this._supplierOfferSrv.deleteBy({ priceRequestId: id }, manager);
                if (!offersDeleted) { this._logger.warn(`Couldn't delete related SupplierOffer for priceRequest [${id}].`); }
    
                // Delete linked PriceRequestElements
                const elementsDeleted = await this._priceRequestAssignationMgr.deleteAllPriceRequestElements(id, manager);
                if (!elementsDeleted) { this._logger.warn(`Couldn't delete related PriceRequestElements for priceRequest [${id}].`); }
    
                return await this._priceRequestSrv.delete(id, manager);
            }).catch(err => { throw ErrorUtil.get(err); });
        }else{
            throw new BadRequestException(ERROR_MESSAGE.FORBIDDEN);
        }
    }

    @Mutation("updatePriceRequest")
    @Access(GRANT_TOKEN.FRONT_ACCESS)
    public async updatePriceRequest(@Args("id") id: number, @Args("data") data: PriceRequestUpdate, @UUID() uuid: string, @Context() ctx: any): Promise<PriceRequest> {
        //check permission update price requests
        let updatepermisssion = this._authSrv.authorized(ctx.req.user.userGroup,PERMISSION_CATEGORIES.PRICE_REQUESTS,PERMISSION_TYPES.WRITE);
        if(updatepermisssion){
            return this._priceRequestSrv.update(id, data, uuid);
        }else{
            throw new BadRequestException(ERROR_MESSAGE.FORBIDDEN);
        }    
    }

    @Mutation("freePriceRequestReference")
    @Access(GRANT_TOKEN.FRONT_ACCESS)
    public async freeNumber(@Usr() user: User): Promise<boolean> {
        return this._uniqueSrv.freeNumber(NUMBER_TYPE.PRICE_REQUEST, user);
    }

    @Mutation("assignSupplyListsToPriceRequest")
    @Access(GRANT_TOKEN.FRONT_ACCESS)
    public async assignToPriceRequest(@Args("priceRequestId") priceRequestId: number, @Args("supplyListIds") supplyListIds: number[], @UUID() uuid: string): Promise<boolean> {
        return await getConnection().transaction(async manager => {
            return await this._priceRequestAssignationMgr.assignSupplyList({ id: priceRequestId }, supplyListIds, manager, uuid);
        }).catch(err => { throw ErrorUtil.get(err); });
    }

    @Mutation("freeSupplyListFromPriceRequest")
    @Access(GRANT_TOKEN.FRONT_ACCESS)
    public async freeFromPriceRequest(@Args("supplyListId") supplyListId: number, @UUID() uuid: string): Promise<boolean> {
        const supplyList: SupplyList = await this._supplyListSrv.getById(supplyListId, uuid);
        return await getConnection().transaction(async manager => {
            return this._priceRequestAssignationMgr.freeSupplyList(supplyList, manager);
        }).catch(err => { throw ErrorUtil.get(err); });
    }

    @Mutation("saveAmalgams")
    @Access(GRANT_TOKEN.FRONT_ACCESS)
    public async saveCascadeAmalgams(
        @Args("priceRequestId") priceRequestId: number,
        @Args("data") amalgams: AmalgamInput[],
        @Args("generation") generation: GqlBarsetGenerationUpdate
    ): Promise<Amalgam[]> {
        if (!(await this._priceRequestAssignationMgr.isPriceRequestEditable(priceRequestId))) { return []; }

        await getConnection().transaction(async manager => {
            const saved = await this._priceRequestAssignationMgr.saveAmalgams(priceRequestId, amalgams, manager);
            if (!saved) { throw new InternalServerErrorException(ERROR_MESSAGE.INTERNAL_SERVER_ERROR, "Couldn't save given amalgams."); }
            // Update last used params
            if (!!generation) {
                await this._barsetGenerationSrv.updateLastUsedParams(generation.id, generation, manager);
            }
        }).catch(err => { throw ErrorUtil.get(err); });

        return this._amalgamSrv.list({ priceRequestId });
    }

    @ResolveProperty("supplyLists")
    public async getSupplyLists(@Parent() priceRequest: PriceRequest, @UUID() uuid: string): Promise<SupplyList[]> {
        return await this._supplyListSrv.getSupplyListsByPriceRequest(priceRequest.id, uuid);
    }

    @ResolveProperty("elements")
    public async getPriceRequestElements(@Parent() priceRequest: PriceRequest, @UUID() uuid: string): Promise<PriceRequestElement[]> {
        return this._priceRequestElementSrv.getByPriceRequest(priceRequest.id, uuid);
    }

    @ResolveProperty("supplierOffers")
    public async getSupplierOffers(@Parent() priceRequest: PriceRequest, @UUID() uuid: string): Promise<SupplierOffer[]> {
        return this._supplierOfferSrv.getByPriceRequest(priceRequest.id, uuid);
    }

    @ResolveProperty("user")
    public async getUser(@Parent() priceRequest: PriceRequest, @UUID() uuid: string): Promise<User> {
        return priceRequest.userId ? this._userSrv.getById(priceRequest.userId, uuid) : null;
    }

    @ResolveProperty("additionnalCosts")
    public async getAdditionnalCosts(@Parent() priceRequest: PriceRequest, @UUID() uuid: string): Promise<PriceRequestAdditionnalCost[]> {
        return this._priceRequestAdditionnalCostSrv.getByPriceRequest(priceRequest.id, uuid);
    }

    @ResolveProperty("barsetGeneration")
    public async getBarsetGeneration(@Parent() priceRequest: PriceRequest, @UUID() uuid: string): Promise<BarsetGeneration> {
        return this._barsetGenerationSrv.getByPriceRequest(priceRequest.id, uuid);
    }

    @ResolveProperty("linkedProjects")
    public async getLinkedProjects(@Parent() priceRequest: PriceRequest, @UUID() uuid: string): Promise<Project[]> {
        return this._projectSrv.getByPriceRequest(priceRequest.id, uuid);
    }
}