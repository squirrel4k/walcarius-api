import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, Brackets } from "typeorm";
import { PossiblePriceRequestElement } from "../interfaces/price-request-element.interface";
import { SupplierOfferSql } from "../entities/supplier-offer.entity";
import { BaseSqlLoader } from "../../../core/dataloader/sql/base-sql.loader";

interface SupplierInfo {
    supplierOfferId: number;
    supplierMatterIds: number[];
    supplyCategoryIds: number[];
}

@Injectable()
export class PossiblePRElementBySupplierOfferLoader extends BaseSqlLoader<PossiblePriceRequestElement[]> {

    public constructor (
        @InjectRepository(SupplierOfferSql) private readonly _supplierOfferRepo: Repository<SupplierOfferSql>,
    ) {
        super("possiblePRElementBySupplierOffer");
    }

    protected async findByIds(ids: number[]): Promise<PossiblePriceRequestElement[][]> {
        const supplierInfos = await this.getSupplierMatterIds(ids);

        const possiblePRE = await this._supplierOfferRepo.createQueryBuilder("so")
            .select("DISTINCT pre.*, so.id AS supplierOfferId")
            .addSelect("COALESCE(ag.supplyCategoryId, sle.supplyCategoryId) AS supplyCategoryId, ag.matterId AS amalgamMatterId")
            .addSelect("COALESCE(sle.denomination, ag.reference) AS name_, COALESCE(sle.format, ag.format) AS format_")
            .addSelect("soe.id AS supplierOfferElementId")
            .leftJoin("so.supplier", "s")
            .leftJoin("s.supplyCategories", "sc")
            .leftJoin("so.priceRequest", "pr")
            .leftJoin("pr.priceRequestElements", "pre")
            .leftJoin("pre.supplyListElement", "sle")
            .leftJoin("pre.amalgamGroup", "ag")
            .leftJoin("so.elements", "soe", "pre.id = soe.priceRequestElementId AND soe.variantId IS NULL")
            .where("so.id IN (:...ids)", { ids })
            .andWhere(new Brackets(builder => {
                builder.where("COALESCE(ag.supplyCategoryId, sle.supplyCategoryId) = sc.id")
                    .orWhere("soe.id IS NOT NULL");
            }))
            .orderBy("name_", "ASC")
            .addOrderBy("format_", "ASC")
            .addOrderBy("pre.id", "ASC")
            .getRawMany();

        return ids.map(id => {
            return possiblePRE.filter(pre => {
                const supplierInfo = supplierInfos.find(si => si.supplierOfferId == id);
                let isOk: boolean = pre.supplierOfferId == id;
                // Check whether the element matches the supplier base supplyCategories. Indicates whether the element was added manually or not
                let isOrigin: boolean = supplierInfo.supplyCategoryIds.indexOf(+pre.supplyCategoryId) > -1;
                if (isOk && !!pre.amalgamMatterId) {
                    const matterOk: boolean = supplierInfo.supplierMatterIds.indexOf(pre.amalgamMatterId) > -1;
                    // Eligible even if matter doesn't match if linked manually (which created a supplierOfferElement)
                    isOk = matterOk || !!pre.supplierOfferElementId;
                    isOrigin = isOrigin && matterOk;
                }
                pre.isOrigin = isOrigin;
                return isOk;
            });
        });
    }

    /**
     * @description Get all supplied matters for amalgam by supplierOffer
     * @author Quentin Wolfs
     * @private
     * @param {number[]} supplierOfferIds
     * @returns {Promise<SupplierInfo[]>}
     * @memberof PossiblePRElementBySupplierOfferLoader
     */
    private async getSupplierMatterIds(supplierOfferIds: number[]): Promise<SupplierInfo[]> {
        const result = await this._supplierOfferRepo.createQueryBuilder("so")
            .select("s.id, so.id AS supplierOfferId")
            .addSelect("GROUP_CONCAT(DISTINCT m.id SEPARATOR ',') AS supplierMatterIds")
            .addSelect("GROUP_CONCAT(DISTINCT sc.id SEPARATOR ',') AS supplyCategoryIds")
            .leftJoin("so.supplier", "s")
            .leftJoin("s.matters", "m")
            .leftJoin("s.supplyCategories", "sc")
            .where("so.id IN (:...supplierOfferIds)", { supplierOfferIds })
            .groupBy("s.id")
            .getRawMany();

        return result.map(res => ({
            supplierOfferId: res.supplierOfferId,
            supplierMatterIds: res.supplierMatterIds ? res.supplierMatterIds.split(",").map((matId: string) => +matId) : [],
            supplyCategoryIds: res.supplyCategoryIds ? res.supplyCategoryIds.split(",").map((catId: string) => +catId) : [],
        }));
    }
}