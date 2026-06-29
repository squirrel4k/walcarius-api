import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { AmalgamGroupSql } from "../entities/amalgam-group.entity";
import { Repository } from "typeorm";
import { ManyToOneSqlLoader } from "../../../core/dataloader/sql/mto-sql.loader";

@Injectable()
export class AmalgamGroupLoader extends ManyToOneSqlLoader<AmalgamGroupSql> {

    public constructor(
        @InjectRepository(AmalgamGroupSql) amalgamGroupRepo: Repository<AmalgamGroupSql>
    ) {
        super(amalgamGroupRepo, "amalgamGroups");
    }
}