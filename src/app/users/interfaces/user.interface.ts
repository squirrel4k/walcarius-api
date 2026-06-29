import { Sort } from "../../../core/interfaces/crud.interface";

export interface User {
    id?: number;
    username?: string;
    password?: string;
    isAdmin?: boolean;
    firstname?: string;
    lastname?: string;
    resetToken?: string;
    userGroup?: string;
    deletedAt?: Date;
}

export class UpdateUser{
    username?: string;
    firstname?: string;
    lastname?: string;
    userGroup?: string; 
    isAdmin?: boolean;
}


export enum UserStatus {
    CREATED = "CREATED",
    SENT = "SENT",
    CANCELLED = "CANCELLED"
}

export enum UserSortBy {
    ID = "ID",
    USERGROUP = "USERGROUP",
    FIRSTNAME = "FIRSTNAME",
    LASTNAME = "LASTNAME",
    USERNAME = "USERNAME",
    EMAIL = "EMAIL",
}

export interface UserSort extends Sort {
    sortBy?: UserSortBy;
}
export interface UserInput {
    username?: string;
    firstname?: string;
    lastname?: string;
    userGroup?: string;  
    password?:string;
    isAdmin?: boolean;  
    resetToken: string;
}


export enum UserStatusDisplay {
    CREATED = "Créé",
    SENT = "Envoyé",
    CANCELLED = "Annulé"
}

export interface UserFilter {
    search?: string;
}