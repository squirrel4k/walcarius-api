export interface Pagination {
    limit?: number;
    page?: number;
}

export interface Sort {
    sortDirection?: OrderByDirection;
}

export interface EntityList<T> {
    data: T[];
    count?: number;
}

export enum OrderByDirection {
    ASC = "ASC",
    DESC = "DESC"
}

export interface PaginationResult {
    hasNext?: boolean;
    hasPrevious?: boolean;
    limit?: number;
    page?: number;
    totalPage?: number;
    total?: number;
}