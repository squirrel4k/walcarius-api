import { Pagination, PaginationResult } from "../interfaces/crud.interface";

export const PaginationUtil = new class {

    /**
     * @description Create PaginationResult from requested pagination AND total count
     * @author Quentin Wolfs
     * @param {Pagination} pagination
     * @param {number} count
     * @returns {PaginationResult}
     * @memberof PaginationUtil
     */
    public createFromCount(pagination: Pagination, count: number): PaginationResult {
        const page = pagination && pagination.page ? pagination.page : 1;
        const limit = pagination && pagination.limit ? pagination.limit : 0;
        const pageCount = limit ? Math.ceil(count / limit) : 1;
        const totalPage = pageCount > 0 ? pageCount : 1;

        return {
            hasNext: page < totalPage,
            hasPrevious: page > 1,
            limit,
            page,
            totalPage: pageCount > 0 ? pageCount : 1,
            total: count
        };
    }
};