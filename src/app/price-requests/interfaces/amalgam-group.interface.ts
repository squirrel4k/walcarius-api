import { Element } from "../../elements/interfaces/element.interface";
import { Matter } from "../../elements/interfaces/matter.interface";
import { SupplyCategory } from "../../suppliers/interfaces/supply-category.interface";
import { Amalgam } from "./amalgam.interface";

export interface AmalgamGroup {
    id?: number;
    reference?: string;
    format?: string;
    isEn1090?: boolean;
    isBlack?: boolean;
    isBlasted?: boolean;
    isPrimaryBlasted?: boolean;
    isCut?: boolean;
    isManual?: boolean;
    icon?: string;
    remark?: string;
    matterRef?: string;
    supplyCategoryId?: number;
    supplyCategory?: SupplyCategory;
    matterId?: number;
    matter?: Matter;
    elementId?: number;
    element?: Element;
    amalgams?: Amalgam[];
}