import { BaseSqlLoader } from "../../../core/dataloader/sql/base-sql.loader";
import { Injectable } from "@nestjs/common";
import { PurchaseOrderSql } from "../entities/purchase-order.entity";
import { PurchaseOrder } from "../interfaces/purchase-order.interface";
import { Repository, Brackets } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";

@Injectable()
export class PurchaseOrderByProjectLoader extends BaseSqlLoader<PurchaseOrder[]> {

    public constructor(
        @InjectRepository(PurchaseOrderSql) private readonly _purchaseOrderRepo: Repository<PurchaseOrderSql>
    ) {
        super("purchaseOrdersByProject");
    }

    protected async findByIds(ids: number[]): Promise<PurchaseOrder[][]> {
        const purchaseOrders = await this._purchaseOrderRepo.createQueryBuilder("po")
            .select("DISTINCT po.*, COALESCE(ap_p.id, pre_p.id, po.projectId) AS linkedProjectId")
            .leftJoin("po.elements", "poe", "poe.deletedAt IS NULL")
            .leftJoin("poe.supplierOfferElement", "soe")
            .leftJoin("soe.priceRequestElement", "pre")
            .leftJoin("pre.supplyListElement", "pre_sle")
            .leftJoin("pre_sle.supplyList", "pre_sl")
            .leftJoin("pre_sl.project", "pre_p", "pre_p.deletedAt IS NULL")
            .leftJoin("pre.amalgamGroup", "ag")
            .leftJoin("ag.amalgams", "a")
            .leftJoin("a.parts", "ap")
            .leftJoin("ap.supplyListElement", "ap_sle")
            .leftJoin("ap_sle.supplyList", "ap_sl")
            .leftJoin("ap_sl.project", "ap_p", "ap_p.deletedAt IS NULL")
            .where("po.deletedAt IS NULL")
            .andWhere(new Brackets(builder => {
                builder.where("po.projectId IN (:...ids)", { ids })
                    .orWhere("pre_p.id IN (:...ids)", { ids })
                    .orWhere("ap_p.id IN (:...ids)", { ids });
            }))
            .getRawMany();

        return ids.map(id => purchaseOrders.filter(purchaseOrder => purchaseOrder.linkedProjectId == id || purchaseOrder.projectId == id));
    }
}