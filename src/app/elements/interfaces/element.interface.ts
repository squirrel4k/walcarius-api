import { AmalgamGroup } from "../../price-requests/interfaces/amalgam-group.interface";
import { ElementGroup } from "./element-group.interface";
import { Matter } from "./matter.interface";

export interface Element {
    id?: number;
    name?: string;
    elementGroupId?: number;
    elementGroup?: ElementGroup;
    matterId?: number;
    matter?: Matter;
    natureValues?: any;
    isOrigin?: boolean;
    deletedAt?: Date;
    amalgamGroups?: AmalgamGroup[];
}

export interface InputElement {
    name?: string;
    elementGroupId?: number;
    matterId?: number;
    natureValues?: any;
}

export interface UpdateElement {
    name?: string;
    matterId?: number;
    natureValues?: any;
}