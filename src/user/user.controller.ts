import {
  Body,
  Controller,
  Delete,
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
import { AuthGuard } from '../guards/auth/auth.guard';

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
    const userPayload = req['user'] as { sub?: string } | undefined;
    const userId = userPayload?.sub;
    if (!userId) {
      throw new NotFoundException('User not found');
    }
    return this.userService.findOne(userId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<User> {
    return this.userService.findOne(id);
  }

  @Get('email/:email')
  async findByEmail(@Param('email') email: string): Promise<User | null> {
    const user = await this.userService.findByEmail(email);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  @Delete('email/:email')
  async deleteByEmail(
    @Param('email') email: string,
  ): Promise<{ message: string }> {
    return this.userService.deleteByEmail(email);
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<{ message: string }> {
    return this.userService.delete(id);
  }
}
