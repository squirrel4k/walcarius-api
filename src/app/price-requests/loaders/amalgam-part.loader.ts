import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { AmalgamPartSql } from "../entities/amalgam-part.entity";
import { Repository } from "typeorm";
import { ManyToOneSqlLoader } from "../../../core/dataloader/sql/mto-sql.loader";

@Injectable()
export class AmalgamPartLoader extends ManyToOneSqlLoader<AmalgamPartSql> {

    public constructor(
        @InjectRepository(AmalgamPartSql) amalgamPartRepo: Repository<AmalgamPartSql>
    ) {
        super(amalgamPartRepo, "amalgamParts");
    }
}