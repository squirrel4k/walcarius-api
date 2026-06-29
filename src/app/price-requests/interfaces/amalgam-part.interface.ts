import { Amalgam } from "./amalgam.interface";
import { SupplyListElement } from "../../projects/interfaces/supply-list-element.interface";

export interface AmalgamPart {
    id?: number;
    amalgamId?: number;
    amalgam?: Amalgam;
    supplyListElementId?: number;
    supplyListElement?: SupplyListElement;
}

export interface AmalgamPartInput {
    supplyListElementId?: number;
}