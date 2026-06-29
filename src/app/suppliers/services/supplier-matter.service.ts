import { BaseSqlService } from "../../../core/services/base-sql.service";
import { SupplierMatterSql } from "../entities/supplier-matter.entity";
import { SupplierMatter } from "../interfaces/supplier-matter.interface";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, EntityManager } from "typeorm";
import { SelectedMattersInput, SelectedMatter } from "../interfaces/supplier.interface";
import { ErrorUtil } from "../../../core/utils/error.util";
import { Matter } from "../../elements/interfaces/matter.interface";

export class SupplierMatterService extends BaseSqlService<SupplierMatterSql, SupplierMatter, SupplierMatter> {

    public constructor(
        @InjectRepository(SupplierMatterSql) supplierMatterRepo: Repository<SupplierMatterSql>,
    ) {
        super(supplierMatterRepo, null, SupplierMatterSql, false);
    }

    /**
     * @description Set all selected matters for a supplier
     * @author Quentin Wolfs
     * @param {number} supplierId
     * @param {SelectedMattersInput[]} data
     * @param {EntityManager} transaction
     * @returns {Promise<boolean>}
     * @memberof SupplierMatterService
     */
    public async setSelectedMatterForSupplier(supplierId: number, data: SelectedMattersInput[], transaction: EntityManager): Promise<boolean> {
        try {
            const selectedIds = data.filter(matter => matter.selected).map(matter => matter.id);
            await this.deleteBy({ supplierId }, transaction);
            const links = await this.createMany(selectedIds.map(matterId => ({ supplierId, matterId })), transaction);

            return links.length === selectedIds.length;
        } catch (e) {
            throw ErrorUtil.get(e);
        }
    }

    /**
     * @description Get all selected Matters from list of all Matter for a given Supplier
     * @author Quentin Wolfs
     * @param {number} supplierId
     * @param {Matter[]} matters
     * @returns {Promise<SelectedMatter[]>}
     * @memberof SupplierMatterService
     */
    public async getSelectedMatter(supplierId: number, matters: Matter[]): Promise<SelectedMatter[]> {
        try {
            const bySupplier: SupplierMatter[] = await this.getBy({ supplierId });

            return matters
                .sort((a, b) => a.id > b.id ? 1 : -1)
                .map(matter => ({
                    id: matter.id,
                    selected: bySupplier.find(sm => sm.matterId == matter.id) != null,
                    name: matter.en1090Name || matter.name
                }));
        } catch (e) {
            throw ErrorUtil.get(e);
        }
    }
}