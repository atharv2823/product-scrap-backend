import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { Request } from 'express';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const token = this.extractToken(request);

    if (!token) {
      throw new UnauthorizedException('Token not provided');
    }

    try {
      const payload = await this.jwtService.verifyAsync(token);
      request['user'] = payload;
    } catch {
      throw new UnauthorizedException('Invalid or expired token');
    }

    return true;
  }

  private extractToken(request: Request): string | undefined {
    // 1. Authorization: Bearer <token>
    const [type, bearerToken] = request.headers.authorization?.split(' ') ?? [];
    if (type === 'Bearer' && bearerToken) {
      return bearerToken;
    }

    // 2. Custom header: x-access-token or access_token
    const customHeader =
      request.headers['x-access-token'] || request.headers['access_token'];
    if (typeof customHeader === 'string' && customHeader.trim()) {
      return customHeader.trim();
    }

    // 3. Request body: { access_token: "..." } or { token: "..." }
    const body = request.body as Record<string, any> | undefined;
    if (body && typeof body === 'object') {
      if (typeof body.access_token === 'string' && body.access_token.trim()) {
        return body.access_token.trim();
      }
      if (typeof body.token === 'string' && body.token.trim()) {
        return body.token.trim();
      }
    }

    // 4. Query param: ?access_token=... or ?token=...
    const query = request.query as Record<string, any> | undefined;
    if (query && typeof query === 'object') {
      if (typeof query.access_token === 'string' && query.access_token.trim()) {
        return query.access_token.trim();
      }
      if (typeof query.token === 'string' && query.token.trim()) {
        return query.token.trim();
      }
    }

    return undefined;
  }
}
