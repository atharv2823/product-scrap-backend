import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { RagService } from '../ai/rag/rag.service';
import { ChatQueryDto } from './dto/chat-query.dto';

@Controller('chat')
export class ChatController {
  constructor(private readonly ragService: RagService) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  async askShoppingAssistant(@Body() body: ChatQueryDto) {
    const answer = await this.ragService.answerShoppingQuery(body.message);
    return {
      success: true,
      answer,
    };
  }
}
