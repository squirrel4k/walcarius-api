import { Nature } from "./nature.interface";
import { Action } from "./action.interface";
import { Matter } from "./matter.interface";

export interface ActionGroup {
    id?: number;
    name?: string;
    icon?: string;
    parameters?: Nature[];
    useClass?: string;
    actions?: Action[];
    availableMatters?: Matter[];
}