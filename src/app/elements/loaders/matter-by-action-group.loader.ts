import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Matter } from "../interfaces/matter.interface";
import { MatterSql } from "../entities/matter.entity";
import { BaseSqlLoader } from "../../../core/dataloader/sql/base-sql.loader";

@Injectable()
export class MatterByActionGroupLoader extends BaseSqlLoader<Matter[]> {

    public constructor (
        @InjectRepository(MatterSql) private readonly _matterRepo: Repository<MatterSql>
    ) {
        super("matterByActionGroups");
    }

    protected async findByIds(ids: number[]): Promise<Matter[][]> {
        const matters = await this._matterRepo.createQueryBuilder("m")
            .select("DISTINCT m.id, m.name, m.en1090Name, m.pricePerKg, m.kgByLiter, ag.id AS ag_id")
            .leftJoin("actions", "a", "a.matterId = m.id")
            .leftJoin("actionGroups", "ag", "ag.id = a.actionGroupId")
            .where("m.deletedAt IS NULL")
            .andWhere("ag.id IN (:...id)", { id: ids })
            .getRawMany();

        return ids.map(id => matters.filter(matter => matter.ag_id == id));
    }
}