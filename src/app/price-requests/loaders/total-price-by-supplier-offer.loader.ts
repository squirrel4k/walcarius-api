import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { SupplierOfferElementSql } from "../entities/supplier-offer-element.entity";
import { BaseSqlLoader } from "../../../core/dataloader/sql/base-sql.loader";
import { PriceCalculatorManager } from "../managers/price-calculator.manager";
import { SupplierOfferElement } from "../interfaces/supplier-offer-element.interface";
import { ElementPriceCalculatorData, OptionPriceCalculatorData } from "../interfaces/price-calculator.interface";
import { VariantOption } from "../interfaces/variant-option.interface";
import { SupplierOfferElementOption } from "../interfaces/supplier-offer-element-option.interface";
import { Variant } from "../interfaces/variant.interface";
import { PriceRequestElement } from "../interfaces/price-request-element.interface";
import { QuantityUnit, SupplyListElement } from "../../projects/interfaces/supply-list-element.interface";
import { AmalgamGroup } from "../interfaces/amalgam-group.interface";
import { OptionUnit } from "../interfaces/price-request-element-option.interface";
import { ElementUnit } from "src/app/purchase-orders/interfaces/purchase-order-element.interface";

interface ElementData extends ElementPriceCalculatorData {
    supplierOfferElementId?: number;
    supplierOfferId?: number;
    stock?: number;
}

@Injectable()
export class TotalPriceBySupplierOfferLoader extends BaseSqlLoader<number> {

    public constructor (
        @InjectRepository(SupplierOfferElementSql) private readonly _supplierOfferElementRepo: Repository<SupplierOfferElementSql>,
        private readonly _priceCalculatorMgr: PriceCalculatorManager
    ) {
        super("totalPriceBySupplier");
    }

    protected async findByIds(ids: number[]): Promise<number[]> {
        const elements = await this._supplierOfferElementRepo.createQueryBuilder("soe")
            .leftJoinAndSelect("soe.priceRequestElement", "pre")
            .leftJoinAndSelect("pre.supplyListElement", "sle")
            .leftJoinAndSelect("pre.amalgamGroup", "ag")
            .leftJoinAndSelect("ag.amalgams", "a")
            .leftJoinAndSelect("soe.variant", "v")
            .leftJoinAndSelect("soe.options", "soeo")
            .leftJoinAndSelect("soeo.priceRequestElementOption", "preo")
            .leftJoinAndSelect("v.options", "vo")
            .where("soe.supplierOfferId IN (:...ids)", { ids })
            .getMany();

        const priceData = this.formatElementsToPriceCalculatorData(elements);

        return ids.map(id => {
            const relatedData = priceData.filter(data => data.supplierOfferId == id);
            if (relatedData.length == 0) { return 0; }

            const total = relatedData.map(data => this._priceCalculatorMgr.getPrice(data))
                .reduce((prev, curr) => prev + curr);

            return parseFloat(total.toFixed(2));
        });
    }

    private formatElementsToPriceCalculatorData(elements: SupplierOfferElement[]): ElementData[] {
        return elements.map(element => {
            let data: ElementData = {
                supplierOfferElementId: element.id,
                supplierOfferId: element.supplierOfferId,
                stock: element.priceRequestElement.amalgamGroup ? element.priceRequestElement.amalgamGroup.amalgams.filter((a: any) => a.isInStock === true)?.length : 0,
                price: element.price,
                ...(element.variant ?
                    this.formatVariantToPriceCalculatorData(element.variant) :
                    this.formatPREToPriceCalculatorData(element.priceRequestElement, element.options)
                ),
                forcedQuantityUnit: <ElementUnit><any>element.unit,
            };
            return data;
        });
    }

    private formatPREToPriceCalculatorData(element: PriceRequestElement, options: SupplierOfferElementOption[]): Partial<ElementData> {
        return {
            quantity: element.quantity,
            weight: element.weight,
            options: this.formatOptionsToPriceCalculatorData(options),
            ...(element.supplyListElement ?
                this.formatSLEToPriceCalculatorData(element.supplyListElement) :
                this.formatAmalgamToPriceCalculatorData(element.amalgamGroup)
            )
        };
    }

    private formatSLEToPriceCalculatorData(element: SupplyListElement): Partial<ElementData> {
        return {
            supplyCategoryId: element.supplyCategoryId,
            format: element.format,
            width: element.width,
            length: element.length,
            quantityUnit: element.quantityUnit
        };
    }

    private formatAmalgamToPriceCalculatorData(amalgamGroup: AmalgamGroup): Partial<ElementData> {
        return {
            supplyCategoryId: amalgamGroup.supplyCategoryId,
            format: amalgamGroup.format
        };
    }

    private formatOptionsToPriceCalculatorData(options: SupplierOfferElementOption[]): OptionPriceCalculatorData[] {
        return options.map(option => ({
            quantity: option.priceRequestElementOption.quantity,
            unit: option.priceRequestElementOption.unit,
            price: option.price
        }));
    }

    private formatVariantToPriceCalculatorData(variant: Variant): Partial<ElementData> {
        return {
            supplyCategoryId: variant.supplyCategoryId,
            quantity: variant.quantity,
            weight: variant.weight,
            length: variant.length,
            width: variant.width,
            format: variant.format,
            quantityUnit: variant.quantityUnit,
            options: this.formatVariantOptionsToPriceCalculatorData(variant.options)
        };
    }

    private formatVariantOptionsToPriceCalculatorData(options: VariantOption[]): OptionPriceCalculatorData[] {
        return options.map(option => ({
            quantity: option.quantity,
            unit: option.unit,
            price: option.price
        }));
    }
}