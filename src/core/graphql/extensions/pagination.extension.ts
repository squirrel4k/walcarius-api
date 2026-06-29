import { GraphQLExtension, GraphQLResponse } from "graphql-extensions";

export class PaginationExtension<TContext = any> extends GraphQLExtension<TContext> {

    /**
     * @description Attach "pagination" to GraphQL response, alongside with data
     * @author Quentin Wolfs
     * @param {{
     *         graphqlResponse: GraphQLResponse;
     *         context: TContext;
     *     }} o
     * @returns {(void | { graphqlResponse: GraphQLResponse; context: TContext })}
     * @memberof PaginationExtension
     */
    public willSendResponse?(o: {
        graphqlResponse: GraphQLResponse;
        context: TContext;
    }): void | { graphqlResponse: GraphQLResponse; context: TContext } {
        if (o.context && (o.context as any).pagination) {
            o.graphqlResponse.data = {
                ...o.graphqlResponse.data,
                pagination: {
                    ...(o.context as any).pagination,
                    __typename: "PaginationResult"
                }
            };
        }
        return {
            context: o.context,
            graphqlResponse: o.graphqlResponse,
        };
    }
}