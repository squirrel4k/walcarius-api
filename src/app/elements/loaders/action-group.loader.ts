import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { ActionGroupSql } from "../entities/action-group.entity";
import { ManyToOneSqlLoader } from "../../../core/dataloader/sql/mto-sql.loader";

@Injectable()
export class ActionGroupLoader extends ManyToOneSqlLoader<ActionGroupSql> {

    public constructor (
        @InjectRepository(ActionGroupSql) actionGroupRepo: Repository<ActionGroupSql>
    ) {
        super(actionGroupRepo, "actionGroups");
    }
}