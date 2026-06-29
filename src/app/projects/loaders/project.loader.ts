import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { ProjectSql } from "../entities/project.entity";
import { ManyToOneSqlLoader } from "../../../core/dataloader/sql/mto-sql.loader";

@Injectable()
export class ProjectLoader extends ManyToOneSqlLoader<ProjectSql> {

    public constructor (
        @InjectRepository(ProjectSql) projectRepo: Repository<ProjectSql>
    ) {
        super(projectRepo, "projects");
    }
}