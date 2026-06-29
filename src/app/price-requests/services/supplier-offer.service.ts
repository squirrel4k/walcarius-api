import { Injectable, BadRequestException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { SupplierOfferSql } from "../entities/supplier-offer.entity";
import { Repository, EntityManager, FindConditions, In } from "typeorm";
import { SupplierOffer, SupplierInfo, SupplierOfferUpdate } from "../interfaces/supplier-offer.interface";
import { PriceRequest } from "../interfaces/price-request.interface";
import { ERROR_MESSAGE } from "../../../core/errors/enum/error.enum";
import { SupplierOfferLoader } from "../loaders/supplier-offer.loader";
import { TotalPriceBySupplierOfferLoader } from "../loaders/total-price-by-supplier-offer.loader";
import { SupplierOfferByPriceRequestLoader } from "../loaders/supplier-offer-by-price-request.loader";
import { PdfResult } from "../../pdf/interfaces/pdf.interface";
import { MailerManager } from "../../mailer/managers/mailer.manager";
import { MAIL_TEMPLATES } from "../../mailer/enums/templates.enum";
import { BaseSqlService } from "../../../core/services/base-sql.service";
import { ErrorUtil } from "../../../core/utils/error.util";
import { SupplierOfferElementService } from "./supplier-offer-element.service";
import { SmtpConfigSql } from "../../smtp-config/entities/smtp-config.entity";
@Injectable()
export class SupplierOfferService extends BaseSqlService<SupplierOfferSql, SupplierOffer, SupplierOfferUpdate> {

    public constructor (
        @InjectRepository(SupplierOfferSql) supplierOfferRepo: Repository<SupplierOfferSql>,
        supplierOfferLoader: SupplierOfferLoader,
        private readonly _totalPriceBySupplierOfferLoader: TotalPriceBySupplierOfferLoader,
        private readonly _supplierOfferByPriceRequestLoader: SupplierOfferByPriceRequestLoader,
        private readonly _supplierOfferElementSrv: SupplierOfferElementService,
        private readonly _mailer: MailerManager
    ) {
        super(supplierOfferRepo, supplierOfferLoader, SupplierOfferSql, false);
    }

    /**
     * @description Generate multiple SupplierOffer based on given info from database and priceRequest
     * @author Quentin Wolfs
     * @param {PriceRequest} priceRequest
     * @param {SupplierInfo[]} supplierInfos
     * @param {EntityManager} [transaction]
     * @returns {Promise<SupplierOffer[]>}
     * @memberof SupplierOfferService
     */
    public async generateMany(priceRequest: PriceRequest, supplierInfos: SupplierInfo[], transaction?: EntityManager): Promise<SupplierOffer[]> {
        try {
            const toSave: SupplierOffer[] = supplierInfos.map(info => {
                return {
                    reference: `${priceRequest.reference}-${info.code}`,
                    supplierId: info.id,
                    supplierContactId: info.favoriteId,
                    priceRequestId: priceRequest.id
                };
            });

            return super.createMany(toSave, transaction);
        } catch (e) {
            throw ErrorUtil.get(e);
        }
    }

    /**
     * @description Get all SupplyCategories ID that concerns this SupplierOffer
     * @author Quentin Wolfs
     * @param {number} id
     * @returns {Promise<number[]>}
     * @memberof SupplierOfferService
     */
    public async getAllCategoryIdsForOffer(id: number): Promise<number[]> {
        try {
            const ids = await this._baseRepo.createQueryBuilder("so")
                .select(["scs.supplyCategoryId AS supplyCategoryId"])
                .leftJoin("suppliers", "s", "so.supplierId = s.id")
                .leftJoin("supplyCategoriesSuppliers", "scs", "s.id = scs.supplierId")
                .where("so.id = :id", { id })
                .getRawMany();

            return ids.map(obj => obj.supplyCategoryId);
        } catch (e) {
            throw ErrorUtil.get(e);
        }
    }

    /**
     * @description Update a SupplierOffer within the database
     * @author Quentin Wolfs
     * @param {number} id
     * @param {SupplierOfferUpdate} data
     * @param {string} uuid
     * @returns {Promise<SupplierOffer>}
     * @memberof SupplierOfferService
     */
    public async update(id: number, data: SupplierOfferUpdate, extra: string | EntityManager): Promise<SupplierOfferSql> {
        try {
            const deletableFields = [
                "elements", "additionnalCosts", "deletedVariantIds", "deletedAdditionnalCostIds", "deletedVariantOptionIds", "deletedSupplierOfferElementOptionIds"
            ];
            deletableFields.forEach(field => {
                if (data[field]) { delete data[field]; }
            });
            if (Object.keys(data).length == 0) { return await this.getById(id, extra); }

            return super.update(id, data, extra);
        } catch (e) {
            throw ErrorUtil.get(e);
        }
    }

    /**
     * @description Gets the total price of all encoded SupplierOfferElements of a SupplierOffer
     * @author Quentin Wolfs
     * @param {number} id
     * @param {string} uuid
     * @returns {Promise<number>}
     * @memberof SupplierOfferService
     */
    public async getTotalPrice(id: number, uuid: string): Promise<number> {
        try {
            return await this._totalPriceBySupplierOfferLoader.get(uuid).load(id);
        } catch (e) {
            throw ErrorUtil.get(e);
        }
    }

    /**
     * @description Gets all SupplierOffer for a given PriceRequest
     * @author Quentin Wolfs
     * @param {number} priceRequestId
     * @param {string} uuid
     * @returns {Promise<SupplierOffer[]>}
     * @memberof SupplierOfferService
     */
    public async getByPriceRequest(priceRequestId: number, uuid: string): Promise<SupplierOffer[]> {
        try {
            return await this._supplierOfferByPriceRequestLoader.get(uuid).load(priceRequestId);
        } catch (e) {
            throw ErrorUtil.get(e);
        }
    }

    /**
     * @description Get all data required for a PriceRequest PDF to send to a Supplier
     * @author Quentin Wolfs
     * @param {number} id
     * @returns {Promise<SupplierOffer[]>}
     * @memberof SupplierOfferService
     */
    public async getDataForSupplierPdf(id: number): Promise<SupplierOffer> {
        try {
            return await this._baseRepo.createQueryBuilder("so")
                .leftJoinAndSelect("so.supplier", "s")
                .leftJoinAndSelect("so.supplierContact", "sc")
                .leftJoinAndSelect("so.priceRequest", "pr")
                .leftJoinAndSelect("pr.additionnalCosts", "prac")
                .where("so.id = :id", { id })
                .getOne();
        } catch (e) {
            throw ErrorUtil.get(e);
        }
    }

    /**
     * @description Send mail with PriceRequest pdf as attachment to a Supplier
     * @author Quentin Wolfs
     * @param {number} supplierOfferId
     * @param {PdfResult} generatedPdf
     * @param {string} uuid
     * @returns {Promise<boolean>}
     * @memberof SupplierOfferService
     */
    public async sendPriceRequestToSupplier(generatedPdf: PdfResult, supplierOffer: SupplierOffer, lang: string, uuid: string, smtpConfig?: SmtpConfigSql): Promise<boolean> {
        try {
            const offer = await this.getById(supplierOffer.id, uuid);
            if (offer && offer.isSent) { throw new BadRequestException(ERROR_MESSAGE.PRICE_REQUEST_ALREADY_SENT); }

            const mailSent: boolean = await this.sendMail(supplierOffer, lang, generatedPdf, smtpConfig);

            return mailSent ? (await this.update(supplierOffer.id, { isSent: true, sendingDate: new Date() }, uuid)) !== null : mailSent;
        } catch (e) {
            throw ErrorUtil.get(e);
        }
    }

    /**
     * @description Send Price Request mail
     * @author Quentin Wolfs
     * @private
     * @param {SupplierOffer} supplierOffer
     * @param {string} lang
     * @param {PdfResult} pdf
     * @returns {Promise<boolean>}
     * @memberof SupplierOfferService
     */
    private async sendMail(supplierOffer: SupplierOffer, lang: string, pdf: PdfResult, smtpConfig?: SmtpConfigSql): Promise<boolean> {
        const email: string = supplierOffer.supplierContact && supplierOffer.supplierContact.mail ? supplierOffer.supplierContact.mail : supplierOffer.supplier.mail;
        if (!email) { throw new BadRequestException(ERROR_MESSAGE.NO_MAIL_FOR_SUPPLIER); }

        return this._mailer.send(
            {
                to: email
            },
            MAIL_TEMPLATES[`PRICE_REQUEST_${lang.toUpperCase()}`],
            { supplierOffer },
            [{ path: pdf.path, filename: pdf.fileName }],
            smtpConfig
        );
    }

    /**
     * @description Delete a SupplierOffer if it wasn't sent to the Supplier and if no prices have been encoded for it
     * @author Quentin Wolfs
     * @param {number} id
     * @param {EntityManager} [transaction]
     * @returns {Promise<boolean>}
     * @memberof SupplierOfferService
     */
    public async delete(id: number, transaction?: EntityManager): Promise<boolean> {
        try {
            const supplierOfferData = await this.getSupplierOfferCanDeleteInfo(id);

            if (!supplierOfferData) { throw new BadRequestException(ERROR_MESSAGE.NO_SUPPLIER_OFFER); }
            if (supplierOfferData.isSent) { throw new BadRequestException(ERROR_MESSAGE.PRICE_REQUEST_ALREADY_SENT); }
            if (supplierOfferData.soeCount > 0) { throw new BadRequestException(ERROR_MESSAGE.SUPPLIER_OFFER_NOT_EMPTY); }

            // Delete elements
            await this._supplierOfferElementSrv.deleteBy({ supplierOfferId: id }, transaction);

            return super.delete(id, transaction);
        } catch (e) {
            throw ErrorUtil.get(e);
        }
    }
    /**
     * @description Delete a SupplierOffer if it wasn't sent to the Supplier and if no prices have been encoded for it
     * @author Quentin Wolfs
     * @param {number[]} ids
     * @param {EntityManager} [transaction]
     * @returns {Promise<boolean>}
     * @memberof SupplierOfferService
     */

    public async deletes(ids: number[], transaction?: EntityManager): Promise<boolean> {
        try {

            if (ids.length) {
                for (const id of ids) {
                    const supplierOfferData = await this.getSupplierOfferCanDeleteInfo(id);
                    if (!supplierOfferData) { throw new BadRequestException(ERROR_MESSAGE.NO_SUPPLIER_OFFER); }
                    if (supplierOfferData.isSent) { throw new BadRequestException(ERROR_MESSAGE.PRICE_REQUEST_ALREADY_SENT); }
                    if (supplierOfferData.soeCount > 0) { throw new BadRequestException(ERROR_MESSAGE.SUPPLIER_OFFER_NOT_EMPTY); }
                }
                const deleteQueryBuilder = this._baseRepo.createQueryBuilder().delete();

                const idClauses = ids.map((_, index) => `ID = :id${index}`);
                const idClauseVariables = ids.reduce((value: any, id, index) => {
                  value[`id${index}`] = id;
                  return value;
                }, {});

                await deleteQueryBuilder.where(idClauses.join(" OR "), idClauseVariables).execute();
            }
            return true;
        } catch (e) {
            throw ErrorUtil.get(e);
        }
    }

    /**
     * @description query returns two info from a supplier offer (isSent and soeCount)
     * @author Raphaeël Michaux
     * @param {number} id
     * @param {null|EntityManager} transaction
     * @returns {Promise<{ isSent: boolean, soeCount: number }>}
     * @memberof SupplierOfferElementService
     */
    public async getSupplierOfferCanDeleteInfo(id: number, transaction?: EntityManager): Promise<{ isSent: boolean, soeCount: number }> {
        try {
            const builder = !!transaction ? transaction.createQueryBuilder(SupplierOfferSql, "so") : this._baseRepo.createQueryBuilder("so");
            const query = builder
                .select("so.isSent AS isSent, COUNT(soe.id) AS soeCount")
                .leftJoin("so.elements", "soe", "soe.price IS NOT NULL")
                .having("so.id = :id", { id })
                .groupBy("so.id");
            return query.getRawOne();
        } catch (err) {
            throw ErrorUtil.get(err);
        }
    }

    /**
     * @description Get all required Data to serialize a SupplierOffer into a PurchaseOrder
     * @author Quentin Wolfs
     * @param {number} id
     * @param {EntityManager} transaction
     * @returns {Promise<SupplierOffer>}
     * @memberof SupplierOfferService
     */
    public async getAllDataForPurchaseOrder(id: number, transaction: EntityManager): Promise<SupplierOffer> {
        try {
            return await transaction.createQueryBuilder(SupplierOfferSql, "so")
                .leftJoinAndSelect("so.priceRequest", "pr")
                .leftJoinAndSelect("so.elements", "soe")
                .leftJoinAndSelect("soe.priceRequestElement", "pre")
                .leftJoinAndSelect("pre.amalgamGroup", "ag")
                .leftJoinAndSelect("pre.supplyListElement", "sle")
                .leftJoinAndSelect("sle.supplyList", "sl")
                .leftJoinAndSelect("sl.project", "p")
                .leftJoinAndSelect("soe.options", "soeo")
                .leftJoinAndSelect("soeo.priceRequestElementOption", "preo")
                .leftJoinAndSelect("soe.variant", "v")
                .leftJoinAndSelect("v.options", "vo")
                .where("so.id = :id", { id })
                .getOne();
        } catch (e) {
            throw ErrorUtil.get(e);
        }
    }

    /**
     * @description Delete all SupplierOffer and their SupplierOfferElement matching the given condition
     * @author Quentin Wolfs
     * @param {FindConditions<SupplierOfferSql>} condition
     * @param {EntityManager} [transaction]
     * @returns {Promise<boolean>}
     * @memberof SupplierOfferService
     */
    public async deleteBy(condition: FindConditions<SupplierOfferSql>, transaction?: EntityManager): Promise<boolean> {
        try {
            const selected = await super.getBy(condition, transaction);
            if (selected.length == 0) { return true; }

            return await this._supplierOfferElementSrv.deleteBy({ supplierOfferId: In(selected.map(so => so.id)) }, transaction)
                && await super.deleteBy(condition, transaction);
        } catch (err) {
            throw ErrorUtil.get(err);
        }
    }
}