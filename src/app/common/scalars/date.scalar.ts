import { Scalar } from "@nestjs/graphql";
import { Kind } from "graphql";

@Scalar("Date")
export class DateScalar {
    public description = "Date custom scalar";

    /**
     * @description Parse value from GraphQL's variables
     * @author Quentin Wolfs
     * @param {any} value
     * @returns {Date}
     * @memberof DateScalar
     */
    public parseValue(value: any): Date {
        return value && !isNaN(parseInt(value, 10)) ? new Date(value * 1000) : null;
    }

    /**
     * @description Parse value from GraphQL's (direct) parameters
     * @author Quentin Wolfs
     * @param {*} ast
     * @returns
     * @memberof DateScalar
     */
    public parseLiteral(ast: any) {
        if (ast.kind === Kind.INT) {
            return new Date(ast.value * 1000);
        }

        return null;
    }

    /**
     * @description Serialize value to send to GraphQL
     * @author Quentin Wolfs
     * @param {Date} value
     * @returns {number}
     * @memberof DateScalar
     */
    public serialize(value: Date): number {
        if (value === null || value === undefined) { return null; }
        return Math.floor(value.getTime() / 1000);
    }

}