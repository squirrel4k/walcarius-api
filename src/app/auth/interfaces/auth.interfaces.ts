import { User } from "../../users/interfaces/user.interface";

export interface GrantedToken {
    access_token: string;
    token_type: "bearer";
    expires_in: number;
    created_at: number;
}

export interface AuthUser extends User {
    token?: string;
    csrf?: string;
    uuid?: string;
    grant?: string;
}