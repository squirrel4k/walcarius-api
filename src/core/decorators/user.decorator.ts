import { createParamDecorator } from "@nestjs/common";

export const Usr = createParamDecorator(
    (data, [root, args, ctx, info]) => ctx.req.user,
);