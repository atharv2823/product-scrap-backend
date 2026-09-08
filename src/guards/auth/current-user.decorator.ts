import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export interface UserPayload {
  sub: string;
  email: string;
  [key: string]: any;
}

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): UserPayload | undefined => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
