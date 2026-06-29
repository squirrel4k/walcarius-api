import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { AmalgamPartSql } from "../entities/amalgam-part.entity";
import { OneToManySqlLoader } from "../../../core/dataloader/sql/otm-sql.loader";

@Injectable()
export class AmalgamPartByAmalgamLoader extends OneToManySqlLoader<AmalgamPartSql> {

    public constructor (
        @InjectRepository(AmalgamPartSql) amalgamPartRepo: Repository<AmalgamPartSql>
    ) {
        super(amalgamPartRepo, "amalgamPartsByAmalgam", "amalgamId");
    }
}