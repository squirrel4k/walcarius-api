import { createParamDecorator } from "@nestjs/common";

export const UUID = createParamDecorator(
    (data, [root, args, ctx, info]) => ctx.req.requestUUID,
);