import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { AmalgamPartSql } from "../entities/amalgam-part.entity";
import { Repository, In, EntityManager } from "typeorm";
import { AmalgamPartInput, AmalgamPart } from "../interfaces/amalgam-part.interface";
import { AmalgamPartByAmalgamLoader } from "../loaders/amalgam-part-by-amalgam.loader";
import { Amalgam } from "../interfaces/amalgam.interface";
import { BaseSqlService } from "../../../core/services/base-sql.service";
import { AmalgamPartLoader } from "../loaders/amalgam-part.loader";
import { ErrorUtil } from "../../../core/utils/error.util";

@Injectable()
export class AmalgamPartService extends BaseSqlService<AmalgamPartSql, AmalgamPartInput, null> {

    public constructor (
        @InjectRepository(AmalgamPartSql) amalgamPartRepo: Repository<AmalgamPartSql>,
        amalgamPartLoader: AmalgamPartLoader,
        private readonly _amalgamPartByAmalgamLoader: AmalgamPartByAmalgamLoader
    ) {
        super(amalgamPartRepo, amalgamPartLoader, AmalgamPartSql, false);
    }

    /**
     * @description Get all AmalgamPart belonging to a Amalgam from database using Dataloader
     * @author Quentin Wolfs
     * @param {number} amalgamId
     * @param {string} uuid
     * @returns {Promise<AmalgamPart[]>}
     * @memberof AmalgamPartService
     */
    public async getByAmalgam(amalgamId: number, uuid: string): Promise<AmalgamPart[]> {
        try {
            return this._amalgamPartByAmalgamLoader.get(uuid).load(amalgamId);
        } catch (e) {
            throw ErrorUtil.get(e);
        }
    }

    /**
     * @description Add AmalgamParts to each given Amalgam
     * @author Quentin Wolfs
     * @param {Amalgam[]} amalgams
     * @param {EntityManager} manager
     * @returns {Promise<Amalgam[]>}
     * @memberof AmalgamPartService
     */
    public async getPartsForAmalgams(amalgams: Amalgam[], manager: EntityManager): Promise<Amalgam[]> {
        try {
            if (amalgams.length == 0) { return []; }

            const amalgamParts = await manager.createQueryBuilder(AmalgamPartSql, "ap")
                .select("ap.*, sle.format AS length")
                .leftJoin("ap.supplyListElement", "sle")
                .where("ap.amalgamId IN (:...ids)", { ids: amalgams.map(am => am.id)})
                .getRawMany();

            return amalgams.map(amalgam => ({
                ...amalgam,
                parts: amalgamParts.filter(part => part.amalgamId == amalgam.id)
            }));
        } catch (e) {
            throw ErrorUtil.get(e);
        }
    }
}