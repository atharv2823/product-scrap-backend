import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  Query,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatQueryDto } from './dto/chat-query.dto';
import { AuthGuard } from '../guards/auth/auth.guard';
import { CurrentUser } from '../guards/auth/current-user.decorator';
import type { UserPayload } from '../guards/auth/current-user.decorator';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post()
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  async askShoppingAssistant(
    @Body() body: ChatQueryDto,
    @CurrentUser() user: UserPayload,
  ) {
    return this.chatService.sendMessage(body.message, user.sub, body.sessionId);
  }

  // ==========================================
  // 🔒 PROTECTED ROUTES: User Chat History
  // ==========================================

  @UseGuards(AuthGuard)
  @Get('history')
  async getChatHistory(
    @CurrentUser() user: UserPayload,
    @Query('limit') limit = 50,
    @Query('sessionId') sessionId?: string,
  ) {
    return this.chatService.getUserChatHistory(user.sub, +limit, sessionId);
  }

  @UseGuards(AuthGuard)
  @Delete('history')
  async clearChatHistory(
    @CurrentUser() user: UserPayload,
    @Query('sessionId') sessionId?: string,
  ) {
    return this.chatService.clearUserChatHistory(user.sub, sessionId);
  }
}
