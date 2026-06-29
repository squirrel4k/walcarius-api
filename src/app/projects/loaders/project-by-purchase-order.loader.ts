import { Injectable } from "@nestjs/common";
import { BaseSqlLoader } from "../../../core/dataloader/sql/base-sql.loader";
import { Project } from "../interfaces/project.interface";
import { Repository } from "typeorm";
import { ProjectSql } from "../entities/project.entity";
import { InjectRepository } from "@nestjs/typeorm";

@Injectable()
export class ProjectByPurchaseOrderLoader extends BaseSqlLoader<Project[]> {

    public constructor(
        @InjectRepository(ProjectSql) private readonly _projectRepo: Repository<ProjectSql>
    ) {
        super("projectByPurchaseOrder");
    }

    protected async findByIds(ids: number[]): Promise<Project[][]> {
        const projects = await this._projectRepo.createQueryBuilder("p")
            .select("DISTINCT p.*, COALESCE(ap_po.id, sle_po.id, po.id) AS purchaseOrderId")
            .leftJoin("p.purchaseOrders", "po")
            .leftJoin("p.supplyLists", "sl")
            .leftJoin("sl.elements", "sle")
            .leftJoin("sle.priceRequestElements", "pre")
            .leftJoin("pre.supplierOfferElements", "soe")
            .leftJoin("soe.purchaseOrderElements", "poe")
            .leftJoin("poe.purchaseOrder", "sle_po")
            .leftJoin("sle.amalgamParts", "ap")
            .leftJoin("ap.amalgam", "a")
            .leftJoin("a.amalgamGroup", "ag")
            .leftJoin("ag.priceRequestElements", "ap_pre")
            .leftJoin("ap_pre.supplierOfferElements", "ap_soe")
            .leftJoin("ap_soe.purchaseOrderElements", "ap_poe")
            .leftJoin("ap_poe.purchaseOrder", "ap_po")
            .where("po.id IN (:...ids)", { ids })
            .orWhere("ap_po.id IN (:...ids)", { ids })
            .orWhere("sle_po.id IN (:...ids)")
            .getRawMany();

        return ids.map(id => projects.filter(project => project.purchaseOrderId == id));
    }
}