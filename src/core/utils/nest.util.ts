import { ExecutionContext } from "@nestjs/common";
import { GqlExecutionContext } from "@nestjs/graphql";
import { ServerResponse, IncomingMessage } from "http";

export const NestUtil = new class {

    /**
     * @description Get request object context, either graphql or rest
     * @author Quentin Wolfs
     * @param {ExecutionContext} context
     * @returns
     */
    public getRequest(context: ExecutionContext): any {
        const httpRequest = context.switchToHttp().getRequest();

        return httpRequest instanceof IncomingMessage ? httpRequest : GqlExecutionContext.create(context).getContext().req;
    }

    /**
     * @description Get response object context, either graphql or rest
     * @author Quentin Wolfs
     * @param {ExecutionContext} context
     * @returns
     */
    public getResponse(context: ExecutionContext): any {
        const httpResponse = context.switchToHttp().getResponse();

        return httpResponse instanceof ServerResponse ? httpResponse : GqlExecutionContext.create(context).getContext().res;
    }
};