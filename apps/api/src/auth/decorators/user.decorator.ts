import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { AuthenticatedUser } from '../types/authenticatedUser';

export const User = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): AuthenticatedUser | null => {
    const request = ctx.switchToHttp().getRequest<Express.Request>();
    if (!request.user) {
      return null;
    }
    return request.user;
  },
);
