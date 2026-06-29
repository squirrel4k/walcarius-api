import { User } from "../../app/users/interfaces/user.interface";
import { PaginationResult } from "./crud.interface";

export interface GqlContext {
    req: {
        user: User;
        requestUUID: string;
    };
    pagination?: PaginationResult;
}
