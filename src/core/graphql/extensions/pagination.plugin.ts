import { ApolloServerPlugin, GraphQLRequestListener } from "@apollo/server";
import { GqlContext } from "../../interfaces/gql-context.interface";

/**
 * @description Apollo plugin replacing the old graphql-extensions PaginationExtension.
 * Attaches `pagination` to the GraphQL response alongside `data`.
 */
export class PaginationPlugin implements ApolloServerPlugin<GqlContext> {

    public async requestDidStart(): Promise<GraphQLRequestListener<GqlContext>> {
        return {
            async willSendResponse({ contextValue, response }): Promise<void> {
                const pagination = (contextValue as any).pagination;
                if (pagination && response.body.kind === "single" && response.body.singleResult.data) {
                    response.body.singleResult.data = {
                        ...response.body.singleResult.data,
                        pagination: {
                            ...pagination,
                            __typename: "PaginationResult"
                        }
                    };
                }
            }
        };
    }
}
