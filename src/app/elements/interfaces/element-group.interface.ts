import { Category } from "./category.interface";
import { Nature } from "./nature.interface";
import { Element } from "./element.interface";
import { Matter } from "./matter.interface";

export interface ElementGroup {
    id?: number;
    name?: string;
    icon?: string;
    useClass?: string;
    categoryId?: number;
    category?: Category;
    elements?: Element[];
    availableMatters?: Matter[];
    elementNatureDefinitions?: Nature[];
}