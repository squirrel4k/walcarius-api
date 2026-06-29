import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { UserSql } from "../entities/user.entity";
import { Repository } from "typeorm";
import { ManyToOneSqlLoader } from "../../../core/dataloader/sql/mto-sql.loader";

@Injectable()
export class UserLoader extends ManyToOneSqlLoader<UserSql> {

    public constructor(
        @InjectRepository(UserSql) userRepo: Repository<UserSql>
    ) {
        super(userRepo, "users");
    }
}