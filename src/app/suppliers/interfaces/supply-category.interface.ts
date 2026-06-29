import { ElementGroup } from "../../elements/interfaces/element-group.interface";
import { AmalgamGroup } from "../../price-requests/interfaces/amalgam-group.interface";
import { SupplyCategoryNature } from "./supply-category-nature.interface";
import { Nature } from "../../elements/interfaces/nature.interface";

export interface SupplyCategory {
    id?: number;
    name?: string;
    parentSupplyCategoryId?: number;
    elementGroupId?: number;
    deletedAt?: Date;
    subCategories?: SupplyCategory[];
    parentSupplyCategory?: SupplyCategory;
    elementGroup?: ElementGroup;
    amalgamGroups?: AmalgamGroup[];
    supplyCategoryNatures?: SupplyCategoryNature[];
    fields?: Nature[];
}

export interface SelectedSupplyCategory extends SupplyCategory {
    selected?: boolean;
}

export interface SelectedSupplyCategoryInput {
    id?: number;
    selected?: boolean;
    subCategories?: SelectedSupplyCategoryInput[];
}