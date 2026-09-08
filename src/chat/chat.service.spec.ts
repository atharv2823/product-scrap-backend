import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ChatService } from './chat.service';
import { ChatMessage } from './entities/chat-message.entity';
import { RagService } from '../ai/rag/rag.service';

describe('ChatService', () => {
  let service: ChatService;
  let ragService: RagService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChatService,
        {
          provide: RagService,
          useValue: {
            answerShoppingQuery: jest
              .fn()
              .mockResolvedValue('Cheapest option is on Amazon at ₹2,499'),
          },
        },
        {
          provide: getRepositoryToken(ChatMessage),
          useValue: {
            create: jest
              .fn()
              .mockImplementation((dto) => ({ id: 'mock-chat-id', ...dto })),
            save: jest
              .fn()
              .mockImplementation((entity) =>
                Promise.resolve({ id: 'mock-chat-id', ...entity }),
              ),
            findAndCount: jest.fn().mockResolvedValue([[], 0]),
            delete: jest.fn().mockResolvedValue({ affected: 1 }),
          },
        },
      ],
    }).compile();

    service = module.get<ChatService>(ChatService);
    ragService = module.get<RagService>(RagService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should send message and return answer', async () => {
    const result = await service.sendMessage(
      'Nike Air Jordan best price?',
      'user-uuid-1',
      'sess-1',
    );
    expect(ragService.answerShoppingQuery).toHaveBeenCalledWith(
      'Nike Air Jordan best price?',
    );
    expect(result.success).toBe(true);
    expect(result.answer).toContain('Cheapest option is on Amazon');
    expect(result.id).toBe('mock-chat-id');
  });

  it('should fetch user chat history', async () => {
    const result = await service.getUserChatHistory('user-uuid-1');
    expect(result.total).toBe(0);
    expect(result.messages).toEqual([]);
  });

  it('should clear user chat history', async () => {
    const result = await service.clearUserChatHistory('user-uuid-1');
    expect(result.success).toBe(true);
  });
});
