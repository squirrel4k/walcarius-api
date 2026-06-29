import { Injectable } from "@nestjs/common";
import { ElementUnitConfig } from "../interfaces/price-request-element.interface";
import { unitConfig } from "../config/unit.config";
import { OptionUnit } from "../interfaces/price-request-element-option.interface";
import { ConversionUtil, LengthUnit, WeightUnit } from "../../../core/utils/conversion.util";
import { ElementPriceCalculatorData, OptionPriceCalculatorData } from "../interfaces/price-calculator.interface";
import { ElementUnit } from "../../purchase-orders/interfaces/purchase-order-element.interface";
import { QuantityUnit } from "../../projects/interfaces/supply-list-element.interface";

@Injectable()
export class PriceCalculatorManager {

    private _config: ElementUnitConfig;

    public constructor(

    ) {
        this._config = unitConfig;
    }

    /**
     * @description Calculates the total price of a single Element and its options, using the correct units to calculate it.
     * @author Quentin Wolfs
     * @param {SupplierOfferElement} element
     * @returns {number}
     * @memberof PriceCalculator
     */
    public getPrice(data: ElementPriceCalculatorData): number {
        let cat: string = Object.keys(this._config.categories).find(key => this._config.categories[key].includes(data.supplyCategoryId));
        cat = cat ? cat : "default";
        const unit: ElementUnit = data.forcedQuantityUnit ? data.forcedQuantityUnit : this._config.units[cat].element;

        const elementPrice = parseFloat('' + this.getElementPrice(data, unit));
        const optionPrice = parseFloat('' + (data.options ? data.options.map(option => this.getOptionPrice(option, data)).reduce((prev, curr) => prev + curr, 0) : 0));

        return 0 + elementPrice + optionPrice;
    }

    /**
     * @description Calculates the price of a single Element, given the given unit
     * @author Quentin Wolfs
     * @private
     * @param {ElementPriceCalculatorData} data
     * @param {ElementUnit} unit
     * @returns {number}
     * @memberof PriceCalculatorManager
     */
    private getElementPrice(data: ElementPriceCalculatorData, unit: ElementUnit): number {
        // If quantity unit is defined and is not "by unit", the element is considered as one "block", as we cannot determine it's real quantity
        const quantity = data.quantityUnit && (data.quantityUnit === QuantityUnit.KG || data.quantityUnit === QuantityUnit.TON) ? 1 : data.quantity;
        const nonStockPercentage = data.stock ? (data.quantity - data.stock) / data.quantity : 1;
        switch (unit) {
            case ElementUnit.EURO:
                return data.price ? data.price * nonStockPercentage : 0;
            case ElementUnit.EURO_BY_METER:
                const format = data.format && !isNaN(+data.format) ? +data.format : 0;
                const meterLength = ConversionUtil.convert(format, LengthUnit.MM, LengthUnit.M);

                return quantity * meterLength * data.price * nonStockPercentage;
            case ElementUnit.EURO_BY_KG:
                // Weight is Total weight, no need to include again the quantity
                return (data.weight * data.price) * nonStockPercentage;
            case ElementUnit.EURO_BY_TON:
                const weight = ConversionUtil.convert(data.weight, WeightUnit.KG, WeightUnit.T);

                // Weight is Total weight, no need to include again the quantity
                return weight * data.price * nonStockPercentage;
            case ElementUnit.EURO_BY_SQUARE_METER:
                const length = data.length && !isNaN(+data.length) ? +data.length : 0;
                const lengthMeterLength = ConversionUtil.convert(length, LengthUnit.MM, LengthUnit.M);
                const width = data.width && !isNaN(+data.width) ? +data.width : 0;
                const widthMeterLength = ConversionUtil.convert(width, LengthUnit.MM, LengthUnit.M);
                
                return data.quantity * lengthMeterLength * widthMeterLength * data.price * nonStockPercentage;
            case ElementUnit.EURO_BY_UNIT:
                return quantity * data.price * nonStockPercentage;
        }
    }

    /**
     * @description Calculates the price of an Option, depending on its unit and related Element
     * @author Quentin Wolfs
     * @private
     * @param {OptionPriceCalculatorData} optionData
     * @param {ElementPriceCalculatorData} elementData
     * @returns {number}
     * @memberof PriceCalculatorManager
     */
    private getOptionPrice(optionData: OptionPriceCalculatorData, elementData: ElementPriceCalculatorData): number {
        switch (optionData.unit) {
            case OptionUnit.EURO:
                return optionData.price ? (elementData.quantity * optionData.price) : 0;
            case OptionUnit.EURO_BY_METER:
                const format = elementData.format && !isNaN(+elementData.format) ? +elementData.format : 0;
                const meterLength = ConversionUtil.convert(format, LengthUnit.MM, LengthUnit.M);

                return elementData.quantity * meterLength * optionData.quantity * optionData.price;
            case OptionUnit.EURO_BY_TON:
                const weight = ConversionUtil.convert(elementData.weight, WeightUnit.KG, WeightUnit.T);

                return weight * optionData.price * optionData.quantity;
            case OptionUnit.EURO_BY_SQUARE_METER:
            case OptionUnit.EURO_BY_UNIT:
                return optionData.quantity * optionData.price;
        }
    }
}