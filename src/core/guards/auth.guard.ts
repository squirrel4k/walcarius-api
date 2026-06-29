import { ExecutionContext, Injectable } from "@nestjs/common";
import { GqlExecutionContext } from "@nestjs/graphql";
import { AuthGuard } from "@nestjs/passport";
import { Reflector } from "@nestjs/core";

@Injectable()
export class AuthenticationGuard extends AuthGuard("jwt") {

    public constructor(
        private readonly _reflector: Reflector
    ) {
        super("jwt");
    }

    public getRequest(context: ExecutionContext) {
        const httpRequest = context.switchToHttp().getRequest();

        return httpRequest ? httpRequest : GqlExecutionContext.create(context).getContext().req;
    }

    public canActivate(context: ExecutionContext) {
        // Check if access are needed for this route / resolver, and deduce if it needs auth or not
        const validAccesses: string[] = this._reflector.get<string[]>("access", context.getHandler());

        // If auth needed, let basic AuthGuard logic
        return validAccesses && validAccesses.length > 0 ? super.canActivate(context) : true;
    }
}