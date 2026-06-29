import { OptionUnit } from "../interfaces/price-request-element-option.interface";
import { ElementUnitConfig, ElementUnitCategory } from "../interfaces/price-request-element.interface";
import { ElementUnit } from "../../purchase-orders/interfaces/purchase-order-element.interface";

export const unitConfig: ElementUnitConfig = {
    categories: {
        [ElementUnitCategory.BEAMS]: [7, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24],
        [ElementUnitCategory.TUBES]: [8, 25, 26, 27],
        [ElementUnitCategory.PLATES]: [9, 28, 29, 30, 31, 32, 44]
    },
    units: {
        [ElementUnitCategory.BEAMS]: {
            element: ElementUnit.EURO_BY_TON,
            option: OptionUnit.EURO_BY_TON
        },
        [ElementUnitCategory.TUBES]: {
            element: ElementUnit.EURO_BY_METER,
            option: OptionUnit.EURO_BY_TON,
        },
        [ElementUnitCategory.PLATES]: {
            element: ElementUnit.EURO_BY_TON,
            option: OptionUnit.EURO_BY_UNIT
        },
        default: {
            element: ElementUnit.EURO_BY_UNIT,
            option: OptionUnit.EURO_BY_UNIT
        }
    }
};