import { AmalgamGroup } from "../../price-requests/interfaces/amalgam-group.interface";
import { Element } from "./element.interface";
import { Action } from "./action.interface";
import { Supplier } from "../../suppliers/interfaces/supplier.interface";

export interface Matter {
    id?: number;
    name?: string;
    en1090Name?: string;
    pricePerKg?: number;
    kgByLiter?: number;
    elements?: Element[];
    actions?: Action[];
    amalgamGroups?: AmalgamGroup[];
    suppliers?: Supplier[];
}