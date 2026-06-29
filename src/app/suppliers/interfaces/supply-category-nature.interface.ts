import { Nature } from "../../elements/interfaces/nature.interface";
import { SupplyCategory } from "./supply-category.interface";

export interface SupplyCategoryNature {
    natureId?: number;
    nature?: Nature;
    supplyCategoryId?: number;
    supplyCategory?: SupplyCategory;
}