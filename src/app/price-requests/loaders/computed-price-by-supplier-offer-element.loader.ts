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
import { SupplyListElement } from "../../projects/interfaces/supply-list-element.interface";
import { AmalgamGroup } from "../interfaces/amalgam-group.interface";

interface ElementData extends ElementPriceCalculatorData {
    supplierOfferElementId?: number;
    supplierOfferId?: number;
}

@Injectable()
export class ComputedPriceBySupplierOfferElementLoader extends BaseSqlLoader<number> {

    public constructor (
        @InjectRepository(SupplierOfferElementSql) private readonly _supplierOfferElementRepo: Repository<SupplierOfferElementSql>,
        private readonly _priceCalculatorMgr: PriceCalculatorManager
    ) {
        super("computedPriceBySupplierOfferElement");
    }

    protected async findByIds(ids: number[]): Promise<number[]> {
        const elements = await this._supplierOfferElementRepo.createQueryBuilder("soe")
            .leftJoinAndSelect("soe.priceRequestElement", "pre")
            .leftJoinAndSelect("pre.supplyListElement", "sle")
            .leftJoinAndSelect("pre.amalgamGroup", "ag")
            .leftJoinAndSelect("soe.variant", "v")
            .leftJoinAndSelect("soe.options", "soeo")
            .leftJoinAndSelect("soeo.priceRequestElementOption", "preo")
            .leftJoinAndSelect("v.options", "vo")
            .where("soe.id IN (:...ids)", { ids })
            .getMany();

        const priceData = this.formatElementsToPriceCalculatorData(elements);

        return ids.map(id => {
            const relatedData = priceData.find(data => data.supplierOfferElementId == id);
            if (!relatedData) { return 0; }

            return +(this._priceCalculatorMgr.getPrice(relatedData).toFixed(2));
        });
    }

    private formatElementsToPriceCalculatorData(elements: SupplierOfferElement[]): ElementData[] {
        return elements.map(element => ({
            supplierOfferElementId: element.id,
            supplierOfferId: element.supplierOfferId,
            price: element.price,
            ...(element.variant ?
                this.formatVariantToPriceCalculatorData(element.variant) :
                this.formatPREToPriceCalculatorData(element.priceRequestElement, element.options)
            )
        }));
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