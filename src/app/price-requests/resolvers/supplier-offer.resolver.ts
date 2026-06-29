import { Resolver, ResolveField, Parent, Args, Mutation, Query } from "@nestjs/graphql";
import { SupplierService } from "../../suppliers/services/supplier.service";
import { SupplierContactService } from "../../suppliers/services/supplier-contact.service";
import { PriceRequestService } from "../services/price-request.service";
import { SupplierOffer, SupplierOfferFilter, SupplierOfferUpdate } from "../interfaces/supplier-offer.interface";
import { UUID } from "../../../core/decorators/uuid.decorator";
import { UseInterceptors } from "@nestjs/common";
import { GqlLoggerInterceptor } from "../../common/interceptors/gql-logger.interceptor";
import { Access } from "../../../core/decorators/access.decorator";
import { GRANT_TOKEN } from "../../common/jwt/jwt.interface";
import { SupplierOfferService } from "../services/supplier-offer.service";
import { SupplierOfferElementService } from "../services/supplier-offer-element.service";
import { PossiblePriceRequestElement } from "../interfaces/price-request-element.interface";
import { PriceRequestElementService } from "../services/price-request-element.service";
import { SupplierOfferAdditionnalCost } from "../interfaces/supplier-offer-additionnal-cost.interface";
import { SupplierOfferAdditionnalCostService } from "../services/supplier-offer-additionnal-cost.service";
import { VariantService } from "../services/variant.service";
import { WinstonLogger } from "../../common/logger/winston.logger";
import { PriceRequestPdfManager } from "../managers/price-request-pdf.manager";
import { DataSource, In } from "typeorm";
import { VariantOptionService } from "../services/variant-option.service";
import { SupplierOfferElementOptionService } from "../services/supplier-offer-element-option.service";
import { PriceRequestAdditionnalCostService } from "../services/price-request-additionnal-cost.service";
import { ErrorUtil } from "../../../core/utils/error.util";
import { PriceRequestStatus } from "../interfaces/price-request.interface";
import { Usr } from "../../../core/decorators/user.decorator";
import { User } from "../../../app/users/interfaces/user.interface";
import { SmtpConfigService } from "../../../app/smtp-config/services/smtp-config.service";
import { SmtpConfigSql } from "../../../app/smtp-config/entities/smtp-config.entity";
import { AdditionnalCostType, AdditionnalCostUnit } from "../interfaces/price-request-additionnal-cost.interface";

@Resolver("SupplierOffer")
@UseInterceptors(GqlLoggerInterceptor)
export class SupplierOfferResolver {

    constructor(
        private readonly _dataSource: DataSource,
        private readonly _supplierOfferSrv: SupplierOfferService,
        private readonly _smtpConfigSrv: SmtpConfigService,
        private readonly _supplierSrv: SupplierService,
        private readonly _supplierContactSrv: SupplierContactService,
        private readonly _priceRequestSrv: PriceRequestService,
        private readonly _supplierOfferElementSrv: SupplierOfferElementService,
        private readonly _supplierOfferElementOptionSrv: SupplierOfferElementOptionService,
        private readonly _priceRequestElementSrv: PriceRequestElementService,
        private readonly _supplierOfferAdditionnalCostSrv: SupplierOfferAdditionnalCostService,
        private readonly _priceRequestAdditionnalCostSrv: PriceRequestAdditionnalCostService,
        private readonly _variantSrv: VariantService,
        private readonly _priceRequestPdfMgr: PriceRequestPdfManager,
        private readonly _variantOptionSrv: VariantOptionService,
        private readonly _logger: WinstonLogger
    ) { }

    @Query("supplierOffer")
    @Access(GRANT_TOKEN.FRONT_ACCESS)
    public async getById(@Args("id") id: number, @UUID() uuid: string): Promise<SupplierOffer> {
        return this._supplierOfferSrv.getById(id, uuid);
    }

    @Query("supplierOffers")
    @Access(GRANT_TOKEN.FRONT_ACCESS)
    public async getList(@Args("filter") filter: SupplierOfferFilter): Promise<SupplierOffer[]> {
        return this._supplierOfferSrv.getList(filter);
    }

    @Mutation("associateSuppliersToPriceRequest")
    @Access(GRANT_TOKEN.FRONT_ACCESS)
    public async createPriceOffers(@Args("priceRequestId") priceRequestId: number, @Args("supplierIds") supplierIds: number[], @UUID() uuid: string): Promise<SupplierOffer[]> {
        const priceRequest = await this._priceRequestSrv.getById(priceRequestId, uuid);
        const existingOffers = await this._supplierOfferSrv.getByPriceRequest(priceRequestId, uuid);
        const newSupplierIds = supplierIds.filter(supplierId => existingOffers.every(offer => offer.supplierId != supplierId));

        if (newSupplierIds.length == 0) { return []; }

        const supplierInfos = await this._supplierSrv.getSupplierOfferInfos(newSupplierIds);
        return this._supplierOfferSrv.generateMany(priceRequest, supplierInfos);
    }

    @Mutation("updateSupplierOffer")
    @Access(GRANT_TOKEN.FRONT_ACCESS)
    public async updateSupplierOffer(@Args("id") id: number, @Args("data") data: SupplierOfferUpdate): Promise<SupplierOffer> {
        return await this._dataSource.transaction(async transaction => {
            // Delete Variant Options
            if (data.deletedVariantOptionIds && data.deletedVariantOptionIds.length > 0) {
                const variantOptionDeletion = await this._variantOptionSrv.deleteBy({ id: In(data.deletedVariantOptionIds) }, transaction);
                if (!variantOptionDeletion) { this._logger.warn(`Coudln't delete Variant Options for ids [${data.deletedVariantOptionIds.join(", ")}]`); }
            }

            // Delete Supplier Offer Element Options
            if (data.deletedSupplierOfferElementOptionIds && data.deletedSupplierOfferElementOptionIds.length > 0) {
                const soeOptionDeletion = await this._supplierOfferElementOptionSrv.deleteBy({ id: In(data.deletedSupplierOfferElementOptionIds) }, transaction);
                if (!soeOptionDeletion) { this._logger.warn(`Coudn't delete SupplierOfferElement Options for ids [${data.deletedSupplierOfferElementOptionIds.join(", ")}]`); }
            }

            // Delete Variants
            if (data.deletedVariantIds && data.deletedVariantIds.length > 0) {
                const soeDeletion = await this._supplierOfferElementSrv.deleteBy({ variantId: In(data.deletedVariantIds) }, transaction);
                const vOptionDeletion = await this._variantOptionSrv.deleteBy({ variantId: In(data.deletedVariantIds) }, transaction);

                const variantDeletion = await this._variantSrv.deleteBy({ id: In(data.deletedVariantIds) }, transaction);
                if (!variantDeletion) { this._logger.warn(`Couldn't delete Variants for ids [${data.deletedVariantIds.join(", ")}]`); }
            }

            // Delete Additionnal Costs
            if (data.deletedAdditionnalCostIds && data.deletedAdditionnalCostIds.length > 0) {
                const additionnalCostDeletion = await this._supplierOfferAdditionnalCostSrv.deleteBy({ id: In(data.deletedAdditionnalCostIds) }, transaction);
                if (!additionnalCostDeletion) { this._logger.warn(`Couldn't delete AdditionnalCosts for ids [${data.deletedAdditionnalCostIds.join(", ")}]`); }
            }

            // Upsert Elements
            let elements = [];
            if (data.elements && data.elements.length > 0) {
                elements = await this._supplierOfferElementSrv.upsertMany(data.elements, transaction);
            }

            // Upsert Additionnal Costs
            let additionnalCosts = [];
            if (data.additionnalCosts && data.additionnalCosts.length > 0) {
                // If Additionnal cost doesn't exist yet, must create it beforehand
                data.additionnalCosts = await Promise.all(data.additionnalCosts.map(async soAdditionnalCost => {
                    if (!soAdditionnalCost.priceRequestAdditionnalCostId) {
                        const prAdditionnalCost = await this._priceRequestAdditionnalCostSrv.create(soAdditionnalCost.priceRequestAdditionnalCost, transaction);
                        soAdditionnalCost.priceRequestAdditionnalCostId = prAdditionnalCost.id;
                    }
                    soAdditionnalCost.price = soAdditionnalCost.inputPrice;
                    if (
                        soAdditionnalCost.unit === AdditionnalCostUnit.EURO_BY_UNIT
                        && soAdditionnalCost.priceRequestAdditionnalCost.type !== AdditionnalCostType.OTHER
                    ) {
                        soAdditionnalCost.price *= soAdditionnalCost.quantity;
                    }
                    delete soAdditionnalCost.priceRequestAdditionnalCost;
                    return soAdditionnalCost;
                }));
                additionnalCosts = await this._supplierOfferAdditionnalCostSrv.upsertMany(data.additionnalCosts, transaction);
            }
            const updatedSupplierOffer = await this._supplierOfferSrv.update(id, data, transaction);
            updatedSupplierOffer.elements = elements;
            updatedSupplierOffer.additionnalCosts = additionnalCosts;

            return updatedSupplierOffer;
        }).catch(err => { throw ErrorUtil.get(err); });
    }

    @Mutation("sendPriceRequestMail")
    @Access(GRANT_TOKEN.FRONT_ACCESS)
    public async sendPriceRequestMail(@Args("id") id: number, @UUID() uuid: string, @Usr() user: User): Promise<boolean> {
        const pdfResult = await this._priceRequestPdfMgr.generatePdf(id);
        let smtpConfig: SmtpConfigSql = await this._smtpConfigSrv.findByLoginId(user.id);
        if (!smtpConfig || !smtpConfig.active) smtpConfig = undefined;

        const sent = await this._supplierOfferSrv.sendPriceRequestToSupplier(pdfResult.pdf, pdfResult.data.supplierOffer, pdfResult.data.lang, uuid, smtpConfig);
        if (sent && pdfResult.data.supplierOffer.priceRequest && pdfResult.data.supplierOffer.priceRequest.status == PriceRequestStatus.CREATED) {
            await this._priceRequestSrv.update(pdfResult.data.supplierOffer.priceRequest.id, { status: PriceRequestStatus.SENT }, uuid);
        }

        return sent;
    }

    @Mutation("sendPriceRequestMails")
    @Access(GRANT_TOKEN.FRONT_ACCESS)
    public async sendPriceRequestMails(@Args("ids") ids: number[], @UUID() uuid: string, @Usr() user: User): Promise<boolean> {
        let done: boolean = true;
        for (const id of ids) {
            done = done && await this.sendPriceRequestMail(id, uuid, user);
        }

        return done;
    }

    @Mutation("deleteSupplierOffer")
    @Access(GRANT_TOKEN.FRONT_ACCESS)
    public async delete(@Args("id") id: number): Promise<boolean> {
        return this._supplierOfferSrv.delete(id);
    }

    @Mutation("deleteSupplierOffers")
    @Access(GRANT_TOKEN.FRONT_ACCESS)
    public async deletes(@Args("ids") ids: number[]): Promise<boolean> {
        return this._supplierOfferSrv.deletes(ids);
    }

    @ResolveField("supplier")
    public async getSupplier(@Parent() supplierOffer: SupplierOffer, @UUID() uuid: string) {
        return supplierOffer.supplierId ? this._supplierSrv.getById(supplierOffer.supplierId, uuid) : null;
    }

    @ResolveField("supplierContact")
    public async getSupplierContact(@Parent() supplierOffer: SupplierOffer, @UUID() uuid: string) {
        return supplierOffer.supplierContactId ? this._supplierContactSrv.getById(supplierOffer.supplierContactId, uuid) : null;
    }

    @ResolveField("priceRequest")
    public async getPriceRequest(@Parent() supplierOffer: SupplierOffer, @UUID() uuid: string) {
        return supplierOffer.priceRequestId ? this._priceRequestSrv.getById(supplierOffer.priceRequestId, uuid) : null;
    }

    @ResolveField("elements")
    public async getElements(@Parent() supplierOffer: SupplierOffer, @UUID() uuid: string) {
        return supplierOffer.elements && Array.isArray(supplierOffer.elements) ?
            supplierOffer.elements : await this._supplierOfferElementSrv.getBySupplierOffer(supplierOffer.id, uuid);
    }

    @ResolveField("totalPrice")
    public async getTotalPrice(@Parent() supplierOffer: SupplierOffer, @UUID() uuid: string) {
        return this._supplierOfferSrv.getTotalPrice(supplierOffer.id, uuid);
    }

    @ResolveField("possibleElements")
    public async getPossibleElements(@Parent() supplierOffer: SupplierOffer, @UUID() uuid: string): Promise<PossiblePriceRequestElement[]> {
        return this._priceRequestElementSrv.getPossiblePriceRequestElementByOffer(supplierOffer.id, uuid);
    }

    @ResolveField("additionnalCosts")
    public async getAdditionnalCosts(@Parent() supplierOffer: SupplierOffer, @UUID() uuid: string): Promise<SupplierOfferAdditionnalCost[]> {
        return this._supplierOfferAdditionnalCostSrv.getBySupplierOffer(supplierOffer.id, uuid);
    }

    @ResolveField("totalAdditionnalCosts")
    public async getTotalAdditionnalCosts(@Parent() supplierOffer: SupplierOffer, @UUID() uuid: string): Promise<number> {
        return this._supplierOfferAdditionnalCostSrv.getTotalPriceBySupplierOffer(supplierOffer.id, uuid);
    }
}