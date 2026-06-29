export interface JwtAccessPayload {
    grant: string;
}

export interface JwtUserPayload {
    id: number;
    email: string;
    isAdmin: boolean;
    uuid?: string;
}

export interface JwtPasswordPayload {
    login: string;
    uuid: string;
}

export enum GRANT_TOKEN {
    SET_PASSWORD = "set_password",
    FRONT_ACCESS = "access"
}