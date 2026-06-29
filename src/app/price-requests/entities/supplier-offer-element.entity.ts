import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToOne, OneToOne, JoinColumn } from "typeorm";
import { SupplierOfferElement } from "../interfaces/supplier-offer-element.interface";
import { SupplierOfferElementOptionSql } from "./supplier-offer-element-option.entity";
import { SupplierOfferSql } from "./supplier-offer.entity";
import { PriceRequestElementSql } from "./price-request-element.entity";
import { VariantSql } from "./variant.entity";
import { PurchaseOrderElementSql } from "../../purchase-orders/entities/purchase-order-element.entity";
import { OptionUnit } from "../interfaces/price-request-element-option.interface";

@Entity({ name: "supplierOfferElements" })
export class SupplierOfferElementSql implements SupplierOfferElement {
    @PrimaryGeneratedColumn()
    public id: number;

    @Column("decimal", { nullable: false })
    public price: number;

    @Column("timestamp", { nullable: true })
    public deliveryDate: Date;

    @Column("boolean", { nullable: false, default: false })
    public isSelected: boolean;

    @Column("int", { nullable: true, default: 0 })
    public selectedQuantity: number;

    @Column("int", { nullable: false })
    public supplierOfferId: number;

    @Column("int", { nullable: true })
    public priceRequestElementId: number;

    @Column("int", { nullable: true })
    public variantId: number;

    @Column({ type: "enum", enum: OptionUnit, default: OptionUnit.EURO_BY_UNIT,nullable:true  })
    public unit: OptionUnit;

    @ManyToOne(type => SupplierOfferSql, so => so.elements)
    public supplierOffer: SupplierOfferSql;

    @ManyToOne(type => PriceRequestElementSql, pre => pre.supplierOfferElements)
    public priceRequestElement: PriceRequestElementSql;

    @OneToOne(type => VariantSql, variant => variant.supplierOfferElement)
    @JoinColumn({ name: "variantId" })
    public variant: VariantSql;

    @OneToMany(type => SupplierOfferElementOptionSql, soeo => soeo.supplierOfferElement)
    public options: SupplierOfferElementOptionSql[];

    @OneToMany(type => PurchaseOrderElementSql, poe => poe.supplierOfferElement)
    public purchaseOrderElements: PurchaseOrderElementSql[];
}