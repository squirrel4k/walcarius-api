import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { MatterSql } from "../entities/matter.entity";
import { Repository } from "typeorm";
import { ManyToOneSqlLoader } from "../../../core/dataloader/sql/mto-sql.loader";

@Injectable()
export class MatterLoader extends ManyToOneSqlLoader<MatterSql> {

    public constructor (
        @InjectRepository(MatterSql) matterRepo: Repository<MatterSql>
    ) {
        super(matterRepo, "matters");
    }
}