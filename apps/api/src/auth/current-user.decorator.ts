import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import type { JwtPayload } from "./jwt-auth.guard";

export const CurrentUser = createParamDecorator(
  (_: unknown, ctx: ExecutionContext): JwtPayload => {
    return ctx.switchToHttp().getRequest<{ user: JwtPayload }>().user;
  },
);
