import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { ManyToOneSqlLoader } from "../../../core/dataloader/sql/mto-sql.loader";
import { PermissionSql } from "../entities/permission.entity";


@Injectable()
export class PermissionLoader extends ManyToOneSqlLoader<PermissionSql> {

    public constructor(
        @InjectRepository(PermissionSql) permissionRepo: Repository<PermissionSql>
    ) {
        super(permissionRepo, "permission");
    }
}