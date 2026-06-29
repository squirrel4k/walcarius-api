import { Entity, PrimaryColumn } from "typeorm";

@Entity({ name: "supplyCategoriesSuppliers" })
export class SupplyCategorySupplierSql {
    @PrimaryColumn()
    public supplierId: number;

    @PrimaryColumn()
    public supplyCategoryId: number;
}