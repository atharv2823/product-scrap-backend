import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from 'src/user/user.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
    constructor(
        private readonly userService: UserService, 

        private readonly jwtService: JwtService,
        
    ) {}

    async register(data: { email: string; password: string; firstName?: string; lastName?: string; age?: number }) {
        const existing = await this.userService.findByEmail(data.email);
        if (existing) {
            throw new BadRequestException('Email already in use');
        }
        const hashedPassword = await bcrypt.hash(data.password, 10);
        const user = await this.userService.create({
            ...data,
            password: hashedPassword,
        });
        const { password, ...result } = user;
        return result;
    }
    async login(email: string, pass: string) {
        const user = await this.userService.findByEmail(email);
        if (!user || !user.password) {
            throw new UnauthorizedException('Invalid credentials');
        }
        const isMatch = await bcrypt.compare(pass, user.password);
        if (!isMatch) {
            throw new UnauthorizedException('Invalid credentials');
        }
        const payload = { sub: user.id, email: user.email };
        return {
            access_token: await this.jwtService.signAsync(payload),
        };
    }
}

