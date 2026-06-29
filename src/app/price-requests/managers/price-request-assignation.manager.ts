import { Injectable, InternalServerErrorException, BadRequestException } from "@nestjs/common";
import { EntityManager, In } from "typeorm";
import { PriceRequestSql } from "../entities/price-request.entity";
import { SupplierService } from "../../suppliers/services/supplier.service";
import { SupplierOfferSql } from "../entities/supplier-offer.entity";
import { SupplierOfferService } from "../services/supplier-offer.service";
import { AmalgamService } from "../services/amalgam.service";
import { AmalgamMakerManager } from "../managers/amalgam-maker.manager";
import { AmalgamInput } from "../interfaces/amalgam.interface";
import { WinstonLogger } from "../../common/logger/winston.logger";
import { AmalgamGroupService } from "../services/amalgam-group.service";
import { ERROR_MESSAGE } from "../../../core/errors/enum/error.enum";
import { PriceRequestService } from "../services/price-request.service";
import { PriceRequestElementService } from "../services/price-request-element.service";
import { PriceRequest } from "../interfaces/price-request.interface";
import { SupplyListService } from "../../projects/services/supply-list.service";
import { SupplyListElementService } from "../../projects/services/supply-list-element.service";
import { SupplyList } from "../../projects/interfaces/supply-list.interface";
import { BarsetGenerationService } from "../services/barset-generation.service";
import { AmalgamPartService } from "../services/amalgam-part.service";

@Injectable()
export class PriceRequestAssignationManager {

    public constructor(
        private readonly _supplierSrv: SupplierService,
        private readonly _supplierOfferSrv: SupplierOfferService,
        private readonly _amalgamSrv: AmalgamService,
        private readonly _amalgamPartSrv: AmalgamPartService,
        private readonly _amalgamGroupSrv: AmalgamGroupService,
        private readonly _amalgamMakerMgr: AmalgamMakerManager,
        private readonly _priceRequestSrv: PriceRequestService,
        private readonly _priceRequestElementService: PriceRequestElementService,
        private readonly _supplyListSrv: SupplyListService,
        private readonly _supplyListElementSrv: SupplyListElementService,
        private readonly _barsetGenerationSrv: BarsetGenerationService,
        private readonly _logger: WinstonLogger
    ) { }

    /**
     * @description Assign Supplier to a PriceRequest according to the given SupplyList
     * @author Quentin Wolfs
     * @param {number[]} supplyListIds
     * @param {number} priceRequestId
     * @param {EntityManager} transaction
     * @returns {Promise<boolean>}
     * @memberof PriceRequestAssignationManager
     */
    public async assignSuppliers(supplyListIds: number[], priceRequestId: number, transaction: EntityManager): Promise<boolean> {
        const priceRequest = await transaction.findOneBy(PriceRequestSql, { id: priceRequestId });
        const suppliers = await this._supplierSrv.getSuppliersBySupplyLists(supplyListIds, transaction);
        const offers = await transaction.find(SupplierOfferSql, { where: { priceRequestId } });

        const toSaveIds = suppliers.filter(supplier => !offers.some(offer => supplier.id == offer.supplierId)).map(supplier => supplier.id);
        if (toSaveIds.length == 0) { return true; }

        const supplierInfos = await this._supplierSrv.getSupplierOfferInfos(toSaveIds, transaction);
        const savedOffers = await this._supplierOfferSrv.generateMany(priceRequest, supplierInfos, transaction);

        return savedOffers.length == toSaveIds.length;
    }

    /**
     * @description Re-generate Amalgams for the given PriceRequest and saves them in Database
     * @author Quentin Wolfs
     * @param {number} priceRequestId
     * @param {EntityManager} transaction
     * @returns {Promise<boolean>}
     * @memberof PriceRequestAssignationManager
     */
    public async regenAmalgam(priceRequestId: number, transaction: EntityManager): Promise<boolean> {
        // Get all locked amalgams for this PriceRequest
        const lockedAmalgams = await this._amalgamSrv.getLockedAmalgamsForPriceRequest(priceRequestId, transaction);

        // Generating amalgams
        const generationResult = await this._amalgamMakerMgr.genAmalgams(priceRequestId, null, lockedAmalgams, transaction);

        // Update barsetGeneration
        await this._barsetGenerationSrv.update(generationResult.generation.id, generationResult.generation, transaction);

        return this.saveAmalgams(priceRequestId, generationResult.amalgams, transaction);
    }

    /**
     * @description Saves Amalgams (and their related parts : PriceRequestElements, AmalgamGroups, ...) in database
     * @author Quentin Wolfs
     * @param {number} priceRequestId
     * @param {AmalgamInput[]} amalgams
     * @param {EntityManager} transaction
     * @returns {Promise<boolean>}
     * @memberof PriceRequestAssignationManager
     */
    public async saveAmalgams(priceRequestId: number, amalgams: AmalgamInput[], transaction: EntityManager): Promise<boolean> {
        // Check AmalgamParts quantity
        const dbCount = await this._supplyListElementSrv.getTotalPartsForPriceRequest(priceRequestId, transaction);
        const givenCount = amalgams.reduce((prev, curr) => prev + curr.parts.length, 0);
        if (dbCount !== givenCount) { throw new BadRequestException(ERROR_MESSAGE.INVALID_AMALGAM_PARTS_QUANTITY); }

        // Deleting old amalgams
        const isDeleted = await this._amalgamSrv.deleteByPriceRequest(priceRequestId, transaction);
        if (!isDeleted) { this._logger.warn(`Could not delete old Amalgams for priceRequest [${priceRequestId}].`); }

        // Assign AmalgamGroup to each Amalgam
        const { amalgamGroups, deleteIds } = await this._amalgamGroupSrv.getGroupsForAmalgams(priceRequestId, amalgams, transaction);
        const assignatedAmalgams = this._amalgamGroupSrv.assignGroups(amalgams, amalgamGroups);

        // Saving new amalgams
        const saved = await this._amalgamSrv.createMultiple(assignatedAmalgams, priceRequestId, transaction);
        if (!amalgamGroups) { throw new InternalServerErrorException(ERROR_MESSAGE.UNABLE_TO_REGEN_AMALGAMS); }
        const amalgamPRE = await this._priceRequestElementService.associateForAmalgamGroups(priceRequestId, amalgamGroups, transaction);

        // Delete unused AmalgamGroups
        const groupsDeleted = deleteIds.length > 0 ? await this._amalgamGroupSrv.deleteByProperty({ id: In(deleteIds) }, transaction) : true;
        if (!groupsDeleted) { this._logger.warn(`Could not delete groups for PriceRequest [${priceRequestId}]`); }

        return amalgamPRE.length == amalgamGroups.length;
    }

    /**
     * @description Assign SupplyLists to a PriceRequest and re-generate Amalgams, PriceRequestElements, ...
     * @author Quentin Wolfs
     * @param {PriceRequest} priceRequest
     * @param {number[]} supplyListIds
     * @param {EntityManager} transaction
     * @param {string} uuid
     * @returns {Promise<boolean>}
     * @memberof PriceRequestAssignationManager
     */
    public async assignSupplyList(priceRequest: PriceRequest, supplyListIds: number[], transaction: EntityManager, uuid: string): Promise<boolean> {
        // Verify that at least one SupplyList ID is given
        if (!supplyListIds || supplyListIds.length == 0) { return true; }

        // Verify if possible to assign SupplyLists to this PriceRequest
        if (!(await this.isPriceRequestEditable(priceRequest.id))) { return false; }

        // Assign Supplylist to PriceRequest
        const addedSupplyList: boolean = await this._supplyListSrv.assignToPriceRequest(priceRequest.id, supplyListIds, transaction, uuid);
        if (!addedSupplyList) {
            throw new InternalServerErrorException(ERROR_MESSAGE.UNABLE_TO_ASSIGN_SUPPLY_LIST);
        }

        // Generate PriceRequestElements
        const notAmalgamPRE = await this._priceRequestElementService.createForNotAmalgams(priceRequest.id, supplyListIds, transaction);
        const generated = await this.regenAmalgam(priceRequest.id, transaction);

        // Assign Suppliers according to SupplyLists
        const withSuppliers = await this.assignSuppliers(supplyListIds, priceRequest.id, transaction);
        if (!withSuppliers) { this._logger.warn(`Suppliers couldn't be assignated to priceRequest [${priceRequest.id}].`); }

        return generated && withSuppliers;
    }

    public async regeneratePriceRequestElements(priceRequestId: number, supplyListIds: number[], transaction: EntityManager, uuid: string) {
                // Generate PriceRequestElements
                const notAmalgamPRE = await this._priceRequestElementService.updateForNotAmalgams(priceRequestId, supplyListIds, transaction, uuid);
                const generated = await this.regenAmalgam(priceRequestId, transaction);
        
                // Assign Suppliers according to SupplyLists
                const withSuppliers = await this.assignSuppliers(supplyListIds, priceRequestId, transaction);
                if (!withSuppliers) { this._logger.warn(`Suppliers couldn't be assignated to priceRequest [${priceRequestId}].`); }
    }
    /**
     * @description Free a SupplyList from a PriceRequest
     * @author Quentin Wolfs
     * @param {SupplyList} supplyList
     * @param {EntityManager} transaction
     * @returns
     * @memberof PriceRequestAssignationManager
     */
    public async freeSupplyList(supplyList: SupplyList, transaction: EntityManager): Promise<boolean> {
        if (!(await this.isPriceRequestEditable(supplyList.priceRequestId))) { return false; }
        const freed = await this._supplyListSrv.freeFromPriceRequest(supplyList, transaction);
        if (!freed) {
            throw new InternalServerErrorException(ERROR_MESSAGE.UNABLE_TO_FREE_SUPPLY_LIST);
        }

        const deleted = await this._priceRequestElementService.deleteForNotAmalgams(supplyList.id, transaction);
        const generated = await this.regenAmalgam(supplyList.priceRequestId, transaction);

        const nowSuppliers = await this._supplierSrv.getSuppliersByCategoriesOfPriceRequest(supplyList.priceRequestId, transaction);
        const offers = await transaction.find(SupplierOfferSql, { where: { priceRequestId: supplyList.priceRequestId } });

        const toDeleteIds = offers.filter(offer => !offer.isSent && !nowSuppliers.some(supplier => supplier.id == offer.supplierId)).map(offer => offer.id);
        const offerDeleted = toDeleteIds.length > 0 ? await this._supplierOfferSrv.deleteBy({ id: In(toDeleteIds) }, transaction) : true;
        if (!offerDeleted) { this._logger.warn(`Couldn't delete unused SupplierOffer for priceRequest [${supplyList.priceRequestId}].`); }

        return deleted && generated;
    }

    /**
     * @description Verify if it's possible to associate/free supplyList on this PriceRequest
     * @author Quentin Wolfs
     * @param {number} priceRequestId
     * @returns {Promise<boolean>}
     * @memberof PriceRequestAssignationManager
     */
    public async isPriceRequestEditable(priceRequestId: number): Promise<boolean> {
        const dataCheck = await this._priceRequestSrv.getDataForUpdateCheck(priceRequestId);
        if (dataCheck.isSentToSupplier) {
            throw new BadRequestException(ERROR_MESSAGE.PRICE_REQUEST_ALREADY_SENT);
        // } else if (dataCheck.isOrdered) {
        //     throw new BadRequestException(ERROR_MESSAGE.PRICE_REQUEST_ALREADY_IN_PURCHASE_ORDER);
        }

        // If no error was thrown, association is valid
        return true;
    }

    /**
     * @description Delete all PriceRequestElements of a PriceRequest with their related amalgams & options
     * @author Quentin Wolfs
     * @param {number} priceRequestId
     * @param {EntityManager} transaction
     * @returns {Promise<boolean>}
     * @memberof PriceRequestAssignationManager
     */
    public async deleteAllPriceRequestElements(priceRequestId: number, transaction: EntityManager): Promise<boolean> {
        const priceRequestElements = await this._priceRequestElementService.getCompleteElementForPriceRequest(priceRequestId, transaction);
        // Split into separate arrays for deletion
        const amalgamGroups = priceRequestElements.filter(element => !!element.amalgamGroup).map(element => element.amalgamGroup);
        const amalgams = amalgamGroups.reduce((acc, curr) => [...acc, ...curr.amalgams], []);
        const amalgamParts = amalgams.reduce((acc, curr) => [...acc, ...curr.parts], []);

        // Delete all elements
        const deletedParts = amalgamParts.length > 0 ? await this._amalgamPartSrv.deleteBy({ id: In(amalgamParts.map(part => part.id)) }, transaction) : true;
        const deletedAmalgams = amalgams.length > 0 ? await this._amalgamSrv.deleteBy({ id: In(amalgams.map(amalgam => amalgam.id)) }, transaction) : true;
        const deletedElements = priceRequestElements.length > 0 ? await this._priceRequestElementService.deleteByIds(priceRequestElements.map(element => element.id), transaction) : true;
        const deletedGroups = amalgamGroups.length > 0 ? await this._amalgamGroupSrv.deleteBy({ id: In(amalgamGroups.map(group => group.id)) }, transaction) : true;

        return deletedElements && deletedGroups && deletedAmalgams && deletedParts;
    }
}