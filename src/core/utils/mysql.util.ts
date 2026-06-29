export const MysqlUtil = new class {

    /**
     * @description calcul offset for pagination
     * @author Kenny Millecamps
     * @export
     * @param {number} limit
     * @param {number} skip
     * @returns {number}
     */
    public calculOffset(limit: number, skip: number): number {
        return (limit * skip) - limit;
    }
};