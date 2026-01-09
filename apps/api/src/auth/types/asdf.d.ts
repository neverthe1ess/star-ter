import { Request } from 'express';
import { AuthenticatedUser } from './authenticatedUser';

declare global {
  namespace Express {
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    interface User extends AuthenticatedUser {}
  }
}
