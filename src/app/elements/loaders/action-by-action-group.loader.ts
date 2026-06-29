import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, IsNull } from "typeorm";
import { ActionSql } from "../entities/action.entity";
import { OneToManySqlLoader } from "../../../core/dataloader/sql/otm-sql.loader";

@Injectable()
export class ActionByActionGroupLoader extends OneToManySqlLoader<ActionSql> {

    public constructor (
        @InjectRepository(ActionSql) actionRepo: Repository<ActionSql>
    ) {
        super(actionRepo, "actionsByActionGroup", "actionGroupId", {
            where: {
                deletedAt: IsNull()
            },
            order: { name: "ASC" }
        });
    }
}