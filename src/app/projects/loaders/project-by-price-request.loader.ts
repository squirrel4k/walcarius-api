import { Injectable } from "@nestjs/common";
import { BaseSqlLoader } from "../../../core/dataloader/sql/base-sql.loader";
import { Project } from "../interfaces/project.interface";
import { Repository } from "typeorm";
import { ProjectSql } from "../entities/project.entity";
import { InjectRepository } from "@nestjs/typeorm";

@Injectable()
export class ProjectByPriceRequestLoader extends BaseSqlLoader<Project[]> {

    public constructor(
        @InjectRepository(ProjectSql) private readonly _projectRepo: Repository<ProjectSql>
    ) {
        super("projectByPriceRequest");
    }

    protected async findByIds(ids: number[]): Promise<Project[][]> {
        const projects = await this._projectRepo.createQueryBuilder("p")
            .select("DISTINCT p.*, COALESCE(ap_pre.priceRequestId, pre.priceRequestId) AS priceRequestId")
            .leftJoin("p.supplyLists", "sl")
            .leftJoin("sl.elements", "sle")
            .leftJoin("sle.priceRequestElements", "pre")
            .leftJoin("sle.amalgamParts", "ap")
            .leftJoin("ap.amalgam", "a")
            .leftJoin("a.amalgamGroup", "ag")
            .leftJoin("ag.priceRequestElements", "ap_pre")
            .where("pre.priceRequestId IN (:...ids)", { ids })
            .orWhere("ap_pre.priceRequestId IN (:...ids)")
            .getRawMany();

        return ids.map(id => projects.filter(project => project.priceRequestId == id));
    }
}