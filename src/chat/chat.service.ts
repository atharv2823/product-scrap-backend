import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RagService } from '../ai/rag/rag.service';
import { ChatMessage } from './entities/chat-message.entity';

@Injectable()
export class ChatService {
  private readonly logger = new Logger(ChatService.name);

  constructor(
    private readonly ragService: RagService,
    @InjectRepository(ChatMessage)
    private readonly chatRepo: Repository<ChatMessage>,
  ) {}

  async sendMessage(
    message: string,
    userId?: string,
    sessionId?: string,
  ): Promise<{
    success: boolean;
    id?: string;
    sessionId?: string | null;
    message: string;
    answer: string;
  }> {
    // 1. Generate shopping RAG answer using Gemini & pgvector
    const answer = await this.ragService.answerShoppingQuery(message);

    // 2. Persist chat message if user is authenticated
    let savedMessageId: string | undefined;
    if (userId) {
      try {
        const chatRecord: ChatMessage = this.chatRepo.create({
          userId,
          sessionId: sessionId || null,
          message,
          response: answer,
        });
        const saved: ChatMessage = await this.chatRepo.save(chatRecord);
        savedMessageId = saved.id;
        this.logger.log(`Saved chat message ${saved.id} for user ${userId}`);
      } catch (err: any) {
        this.logger.error(
          `Failed to save chat message history: ${err?.message || err}`,
        );
      }
    }

    return {
      success: true,
      id: savedMessageId,
      sessionId: sessionId || null,
      message,
      answer,
    };
  }

  async getUserChatHistory(
    userId: string,
    limit = 50,
    sessionId?: string,
  ): Promise<{ total: number; messages: ChatMessage[] }> {
    const whereClause: Record<string, any> = { userId };
    if (sessionId) {
      whereClause.sessionId = sessionId;
    }

    const [messages, total] = await this.chatRepo.findAndCount({
      where: whereClause,
      order: { createdAt: 'ASC' },
      take: limit,
    });

    return { total, messages };
  }

  async clearUserChatHistory(
    userId: string,
    sessionId?: string,
  ): Promise<{ success: boolean; message: string }> {
    const whereClause: Record<string, any> = { userId };
    if (sessionId) {
      whereClause.sessionId = sessionId;
    }

    await this.chatRepo.delete(whereClause);
    return {
      success: true,
      message: sessionId
        ? `Chat history cleared for session ${sessionId}`
        : `Chat history cleared for user ${userId}`,
    };
  }
}
