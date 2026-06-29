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
    material?: string;
    natureValues?: Record<string, unknown>;
    isOrigin?: boolean;
    deletedAt?: Date;
    amalgamGroups?: AmalgamGroup[];
}

export interface InputElement {
    name: string;
    elementGroupId: number;
    matterId: number;
    natureValues?: Record<string, unknown>;
    isOrigin?: boolean;
}

export interface UpdateElement {
    name?: string;
    elementGroupId?: number;
    matterId?: number;
    natureValues?: Record<string, unknown>;
    isOrigin?: boolean;
}
