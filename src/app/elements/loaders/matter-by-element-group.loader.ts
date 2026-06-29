import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { ElementGroupMatterSql } from "../entities/element-group-matter.entity";
import { Matter } from "../interfaces/matter.interface";
import { BaseSqlLoader } from "../../../core/dataloader/sql/base-sql.loader";

@Injectable()
export class MatterByElementGroupLoader extends BaseSqlLoader<Matter[]> {

    public constructor (
        @InjectRepository(ElementGroupMatterSql) private readonly _elementGroupMatterRepo: Repository<ElementGroupMatterSql>
    ) {
        super("matterByElementGroups");
    }

    protected async findByIds(ids: number[]): Promise<Matter[][]> {
        const matters = await this._elementGroupMatterRepo.createQueryBuilder("egm")
            .leftJoinAndSelect("matters", "m", "egm.matterId = m.id")
            .where("m.deletedAt IS NULL")
            .andWhere("egm.elementGroupid IN (:...id)", { id: ids })
            .getRawMany();

        return ids.map(id => {
            const filtred = matters.filter(matter => matter.egm_elementGroupId == id);

            return filtred.map(matter => {
                  return Object.keys(matter)
                    .filter(key => key.startsWith("m_"))
                    .reduce((obj, key) => {
                        obj[key.substr(2)] = matter[key];
                        return obj;
                    }, { });
            });
        });
    }
}