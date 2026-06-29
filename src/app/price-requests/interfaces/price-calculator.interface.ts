import { OptionUnit } from "./price-request-element-option.interface";
import { QuantityUnit } from "../../projects/interfaces/supply-list-element.interface";
import { ElementUnit } from "src/app/purchase-orders/interfaces/purchase-order-element.interface";

export interface ElementPriceCalculatorData {
    supplyCategoryId?: number;
    quantity?: number;
    price?: number;
    weight?: number;
    stock?: number;
    length?: number;
    width?: number;
    format?: string;
    options?: OptionPriceCalculatorData[];
    quantityUnit?: QuantityUnit|string;
    forcedQuantityUnit?: ElementUnit;
}

export interface OptionPriceCalculatorData {
    quantity: number;
    unit: OptionUnit;
    price: number;
}