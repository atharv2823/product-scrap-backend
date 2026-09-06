import { JwtService } from '@nestjs/jwt';
import { AuthGuard } from './auth.guard';

describe('AuthGuard', () => {
  it('should be defined', () => {
    const mockJwtService = { verifyAsync: jest.fn() } as unknown as JwtService;
    expect(new AuthGuard(mockJwtService)).toBeDefined();
  });
});
