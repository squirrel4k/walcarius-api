import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Nature } from "../../elements/interfaces/nature.interface";
import { ElementGroupNatureSql } from "../entities/element-group-nature.entity";
import { BaseSqlLoader } from "../../../core/dataloader/sql/base-sql.loader";

@Injectable()
export class NatureByElementGroupLoader extends BaseSqlLoader<Nature[]> {

    public constructor (
        @InjectRepository(ElementGroupNatureSql) private readonly _elementGroupNatureRepo: Repository<ElementGroupNatureSql>
    ) {
        super("natureByElementGroups");
    }

    protected async findByIds(ids: number[]): Promise<Nature[][]> {
        const natures = await this._elementGroupNatureRepo.createQueryBuilder("egn")
            .leftJoinAndSelect("natures", "n", "egn.natureId = n.id")
            .where("n.deletedAt IS NULL")
            .andWhere("egn.elementGroupid IN (:...id)", { id: ids })
            .getRawMany();

        return ids.map(id => {
            const filtred = natures.filter(nature => nature.egn_elementGroupId == id);

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