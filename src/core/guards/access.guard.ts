import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { NestUtil } from "../utils/nest.util";

@Injectable()
export class AccessGuard implements CanActivate {

    public constructor(
        private readonly _reflector: Reflector
    ) { }

    public canActivate(context: ExecutionContext): boolean {
        // Get access declared for this route / resolver
        const validAccesses = this._reflector.get<string[]>("access", context.getHandler());
        if (!validAccesses) { return true; }

        // Get the user contained in request
        const request = NestUtil.getRequest(context);
        const user = request.user;
        if (!user) { return false; }

        // Check if he has the right grants
        return user.grant && validAccesses.indexOf(user.grant) > -1;
    }
}