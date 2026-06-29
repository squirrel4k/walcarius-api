import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { AmalgamSql } from "../entities/amalgam.entity";
import { Repository } from "typeorm";
import { ManyToOneSqlLoader } from "../../../core/dataloader/sql/mto-sql.loader";

@Injectable()
export class AmalgamLoader extends ManyToOneSqlLoader<AmalgamSql> {

    public constructor(
        @InjectRepository(AmalgamSql) amalgamRepo: Repository<AmalgamSql>
    ) {
        super(amalgamRepo, "amalgams");
    }
}