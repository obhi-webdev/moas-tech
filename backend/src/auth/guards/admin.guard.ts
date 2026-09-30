import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';

import { AuthenticatedRequest } from './jwt-auth.guard.js';

@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();

    if (!request.user) {
      throw new ForbiddenException('Authentication required');
    }

    if (request.user.role !== 'admin') {
      throw new ForbiddenException('Administrator access required');
    }

    return true;
  }
}
