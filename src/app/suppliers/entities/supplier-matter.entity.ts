import { Entity, PrimaryColumn } from "typeorm";

@Entity({ name: "supplierMatters" })
export class SupplierMatterSql {
    @PrimaryColumn({ type: "int" })
    public supplierId: number;

    @PrimaryColumn({ type: "int" })
    public matterId: number;
}