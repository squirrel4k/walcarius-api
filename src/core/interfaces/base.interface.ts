export interface Entity {
    createdAt?: number;
    updatedAt?: number;
    deletedAt?: number;
}

export interface MongoEntity extends Entity {
    _id?: any;
    id?: string;
    __v?: string;
}

export interface SqlEntity extends Entity {
    id?: number;
}

export interface MongoSort {
    sortBy?: string;
    sortDirection?: string;
}