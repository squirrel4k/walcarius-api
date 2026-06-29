import { Matter } from "./matter.interface";
import { ActionGroup } from "./action-group.interface";

export interface Action {
    name?: string;
    natureValues?: any;
    matter?: Matter;
    matterId?: number;
    actionGroupId?: number;
    actionGroup?: ActionGroup;
}

export interface FilterAction {
    actionGroupId?: number;
    matterId?: number;
    thickness?: number;
    section?: number;
    diameter?: number;
}