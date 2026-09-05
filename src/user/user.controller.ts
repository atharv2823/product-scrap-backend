import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
import { UserService } from './user.service';
import { User } from './user.entity';
import { AuthGuard } from 'src/guards/auth/auth.guard';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  async createUser(@Body() body: Partial<User>): Promise<User> {
    return this.userService.create(body);
  }

  @Get()
  async findAll(): Promise<User[]> {
    return this.userService.findAll();
  }

  // ==========================================
  // 🔒 PROTECTED ROUTE: Returns Current User Profile
  // ==========================================
  @UseGuards(AuthGuard)
  @Get('profile')
  async getProfile(@Req() req: Request) {
    // Option A: Return decoded JWT payload ({ sub: userId, email: '...' })
    // return req['user'];
    // Option B (Recommended): Fetch the full user details from the database using the ID in the token
    const userId = req['user'].sub;
    return this.userService.findOne(userId);
  }

  @Get(':id')
  async findOne(@Param('id') id: number): Promise<User> {
    return this.userService.findOne(+id);
  }

  @Get('email/:email')
  async findByEmail(@Param('email') email: string): Promise<User | null> {
    const user = await this.userService.findByEmail(email);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }
}
