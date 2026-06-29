import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Nature } from "../../elements/interfaces/nature.interface";
import { ActionGroupParameterSql } from "../entities/action-group-parameter.entity";
import { BaseSqlLoader } from "../../../core/dataloader/sql/base-sql.loader";

@Injectable()
export class NatureByActionGroupLoader extends BaseSqlLoader<Nature[]> {

    public constructor (
        @InjectRepository(ActionGroupParameterSql) private readonly _actionGroupParametersRepo: Repository<ActionGroupParameterSql>
    ) {
        super("natureByActionGroups");
    }

    protected async findByIds(ids: number[]): Promise<Nature[][]> {
        const natures = await this._actionGroupParametersRepo.createQueryBuilder("agp")
            .leftJoinAndSelect("natures", "n", "agp.parameterId = n.id")
            .where("n.deletedAt IS NULL")
            .andWhere("agp.actionGroupId IN (:...id)", { id: ids })
            .getRawMany();

        return ids.map(id => {
            const filtred = natures.filter(nature => nature.agp_actionGroupId == id);

            return filtred.map(nature => {
                  return Object.keys(nature)
                    .filter(key => key.startsWith("n_"))
                    .reduce((obj, key) => {
                        obj[key.substr(2)] = nature[key];
                        return obj;
                    }, { });
            });
        });
    }
}