import { Injectable } from "@nestjs/common";
import { AmalgamGroupSql } from "../entities/amalgam-group.entity";
import { Repository, EntityManager } from "typeorm";
import { AmalgamGroup } from "../interfaces/amalgam-group.interface";
import { InjectRepository } from "@nestjs/typeorm";
import { AmalgamInput, Amalgam } from "../interfaces/amalgam.interface";
import { ObjectUtil } from "../../../core/utils/object.util";
import { AmalgamGroupLoader } from "../loaders/amalgam-group.loader";
import { StockQuantityByAmalgamGroupLoader } from "../loaders/stock-quantity-by-amalgam-group.loader";
import { BaseSqlService } from "../../../core/services/base-sql.service";
import { ErrorUtil } from "../../../core/utils/error.util";
import { ArrayUtil } from "../../../core/utils/array.util";

@Injectable()
export class AmalgamGroupService extends BaseSqlService<AmalgamGroupSql, AmalgamGroup, AmalgamGroup> {

    public constructor (
        @InjectRepository(AmalgamGroupSql) amalgamGroupRepo: Repository<AmalgamGroupSql>,
        amalgamGroupLoader: AmalgamGroupLoader,
        private readonly _stockQuantityByAmalgamGroupLoader: StockQuantityByAmalgamGroupLoader
    ) {
        super(amalgamGroupRepo, amalgamGroupLoader, AmalgamGroupSql, false);
    }

    /**
     * @description Get all AmalgamGroup from a PriceRequest
     * @author Quentin Wolfs
     * @private
     * @param {number} priceRequestId
     * @param {EntityManager} manager
     * @returns
     * @memberof AmalgamGroupService
     */
    private async getListByPriceRequest(priceRequestId: number, manager: EntityManager) {
        try {
            return await manager.createQueryBuilder(AmalgamGroupSql, "ag")
                .leftJoin("priceRequestElements", "pre", "ag.id = pre.amalgamGroupId")
                .where("pre.priceRequestId = :id", { id: priceRequestId })
                .getMany();
        } catch (e) {
            throw ErrorUtil.get(e);
        }
    }

    /**
     * @description Assign an AmalgamGroup to each given Amalgam
     * @author Quentin Wolfs
     * @param {AmalgamInput[]} amalgams
     * @param {AmalgamGroup[]} amalgamGroups
     * @returns {Promise<Amalgam[]>}
     * @memberof AmalgamGroupService
     */
    public assignGroups(amalgams: AmalgamInput[], amalgamGroups: AmalgamGroup[]): Amalgam[] {
        const comparisonFields: string[] = [
            "reference", "isEn1090", "format", "matterId|matterRef", "isBlack", "isBlasted", "isPrimaryBlasted", "supplyCategoryId", "elementId"
        ];

        return amalgams.map((amalgam: Amalgam) => {
            const foundAmalgamGroup: AmalgamGroup = amalgamGroups.find(grp => ObjectUtil.equalsWithOperators(amalgam, grp, comparisonFields));
            amalgam.amalgamGroupId = foundAmalgamGroup.id;
            amalgam.amalgamGroup = foundAmalgamGroup;

            return amalgam;
        });
    }

    /**
     * @description Get all AmalgamGroup that corresponds to an array of Amalgams. Use AmalgamGroup in database, creates new required amalgams
     * and delete now useless ones
     * @author Quentin Wolfs
     * @param {number} priceRequestId
     * @param {AmalgamInput[]} amalgams
     * @param {EntityManager} manager
     * @returns {Promise<AmalgamGroup[]>}
     * @memberof AmalgamGroupService
     */
    public async getGroupsForAmalgams(priceRequestId: number, amalgams: AmalgamInput[], manager: EntityManager): Promise<{ amalgamGroups: AmalgamGroup[], deleteIds: number[] }> {
        try {
            // Get all possible groups & those in database
            const databaseGroups: AmalgamGroup[] = await this.getListByPriceRequest(priceRequestId, manager);
            const generatedGroups: AmalgamGroup[] = this.generateGroups([...amalgams]);

            // Find already created groups and those that need to be created
            const usableGroups: AmalgamGroup[] = [];
            const savableGroups: AmalgamGroup[] = [];
            generatedGroups.forEach(generated => {
                const saved = databaseGroups.find(group => ObjectUtil.equals(generated, group));
                saved ? usableGroups.push(saved) : savableGroups.push(generated);
            });

            // Get ids of all unused AmalgamGroup for further delete
            const deletableGroupIds: number[] = databaseGroups.filter(group => usableGroups.findIndex(usable => usable.id == group.id) == -1).map(grp => grp.id);

            // Save groups and return concatenation of the new from Database & old from Database
            const savedGroups: AmalgamGroup[] = await this.createMany(savableGroups, manager);
            return { amalgamGroups: [...usableGroups, ...savedGroups], deleteIds: deletableGroupIds };
        } catch (e) {
            throw ErrorUtil.get(e);
        }
    }

    /**
     * @description Delete (hard) all AmalgamGroup that matches given property
     * @author Quentin Wolfs
     * @param {*} property
     * @param {EntityManager} manager
     * @returns {Promise<boolean>}
     * @memberof AmalgamGroupService
     */
    public async deleteByProperty(property: any, manager: EntityManager): Promise<boolean> {
        try {
            const countElements: number = await manager.count(AmalgamGroupSql, { where: property });
            if (countElements == 0) { return true; }

            return countElements > 0 ? (await manager.delete(AmalgamGroupSql, property)).affected == countElements : true;
        } catch (e) {
            throw ErrorUtil.get(e);
        }
    }

    /**
     * @description Generate all AmalgamGroup that corresponds to an array of Amalgams. WARNING : Mutates the given array, use a copy !
     * @author Quentin Wolfs
     * @param {AmalgamInput[]} amalgams
     * @returns {AmalgamGroup[]}
     * @memberof AmalgamGroupService
     */
    public generateGroups(amalgams: AmalgamInput[]): AmalgamGroup[] {
        if (amalgams.length == 0) { return []; }
        const comparisonFields: string[] = [
            "reference", "format", "isEn1090", "isBlack", "isBlasted", "isPrimaryBlasted", "isCut", "matterId|matterRef", "elementId", "supplyCategoryId"
        ];

        const model: AmalgamInput = amalgams.shift();
        const newGroup: AmalgamGroup = {
            reference: model.reference,
            format: model.format.toString(),
            isEn1090: model.isEn1090,
            isBlack: model.isBlack,
            isBlasted: model.isBlasted,
            isPrimaryBlasted: model.isPrimaryBlasted,
            isCut: model.isCut,
            isManual: model.isManual || false,
            matterId: model.matterId,
            matterRef: model.matterRef,
            elementId: model.elementId,
            supplyCategoryId: model.supplyCategoryId,
            icon: model.icon,
            remark: model.remark
        };

        const similarAmalgams = ArrayUtil.splitArray(amalgams, am => ObjectUtil.equalsWithOperators(newGroup, am, comparisonFields));
        if (similarAmalgams.valid.some(am => am.remark != newGroup.remark)) { newGroup.remark = null; }

        return [newGroup, ...this.generateGroups(similarAmalgams.invalid)];
    }

    /**
     * @description Get the number of amalgams that are linked to each AmalgamGroup
     * @author Quentin Wolfs
     * @param {AmalgamGroup[]} amalgamGroups
     * @param {EntityManager} manager
     * @returns {Promise<{ id: number, quantity: number }[]>}
     * @memberof AmalgamGroupService
     */
    public async getAmalgamCountByGroup(amalgamGroups: AmalgamGroup[], manager: EntityManager): Promise<{ id: number, quantity: number }[]> {
        try {
            if (amalgamGroups.length == 0) { return []; }

            return await manager.createQueryBuilder(AmalgamGroupSql, "ag")
                .select(["ag.id AS id", "COUNT(a.id) AS quantity"])
                .leftJoin("amalgams", "a", "ag.id = a.amalgamGroupId")
                .groupBy("ag.id")
                .having("ag.id IN (:...ids)", { ids: amalgamGroups.map(grp => grp.id) })
                .getRawMany();
        } catch (e) {
            throw ErrorUtil.get(e);
        }
    }

    /**
     * @description Gets the number of AmalgamParts contained in an AmalgamGroup
     * @author Quentin Wolfs
     * @param {AmalgamGroup} amalgamGroup
     * @param {EntityManager} manager
     * @returns {Promise<number>}
     * @memberof AmalgamGroupService
     */
    public async getAmalgamPartCount(amalgamGroup: AmalgamGroup, manager: EntityManager): Promise<number> {
        try {
            const result = await manager.createQueryBuilder(AmalgamGroupSql, "ag")
                .select("COUNT(ap.id) AS count")
                .leftJoin("amalgams", "a", "ag.id = a.amalgamGroupId")
                .leftJoin("amalgamParts", "ap", "a.id = ap.amalgamId")
                .groupBy("ag.id")
                .having("ag.id = :id", { id: amalgamGroup.id })
                .getRawOne();

            return result.count;
        } catch (e) {
            throw ErrorUtil.get(e);
        }
    }

    /**
     * @description Get the number of linked Amalgam that are currently in stock
     * @author Quentin Wolfs
     * @param {number} id
     * @param {string} uuid
     * @returns {Promise<number>}
     * @memberof AmalgamGroupService
     */
    public async getStockQuantity(id: number, uuid: string): Promise<number> {
        try {
            return this._stockQuantityByAmalgamGroupLoader.get(uuid).load(id);
        } catch (e) {
            throw ErrorUtil.get(e);
        }
    }
}