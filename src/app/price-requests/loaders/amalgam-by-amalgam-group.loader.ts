import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { AmalgamSql } from "../entities/amalgam.entity";
import { OneToManySqlLoader } from "../../../core/dataloader/sql/otm-sql.loader";

@Injectable()
export class AmalgamByAmalgamGroupLoader extends OneToManySqlLoader<AmalgamSql> {

    public constructor (
        @InjectRepository(AmalgamSql) amalgamRepo: Repository<AmalgamSql>
    ) {
        super(amalgamRepo, "amalgamsByAmalgamGroup", "amalgamGroupId");
    }
}