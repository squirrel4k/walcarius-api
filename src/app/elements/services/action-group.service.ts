import { Injectable } from "@nestjs/common";
import { ActionGroupLoader } from "../loaders/action-group.loader";
import { BaseSqlService } from "../../../core/services/base-sql.service";
import { ActionGroupSql } from "../entities/action-group.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

@Injectable()
export class ActionGroupService extends BaseSqlService<ActionGroupSql, null, null> {

    public constructor(
        @InjectRepository(ActionGroupSql) actionGroupRepo: Repository<ActionGroupSql>,
        actionGroupLoader: ActionGroupLoader,
    ) {
        super(actionGroupRepo, actionGroupLoader, ActionGroupSql, true);
    }
}