import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';

describe('ChatController', () => {
  let controller: ChatController;
  let chatService: ChatService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ChatController],
      providers: [
        {
          provide: ChatService,
          useValue: {
            sendMessage: jest.fn().mockResolvedValue({
              success: true,
              answer: 'Test Answer',
            }),
            getUserChatHistory: jest.fn().mockResolvedValue({
              total: 1,
              messages: [
                {
                  id: 'msg-1',
                  message: 'Hello',
                  response: 'Hi',
                },
              ],
            }),
            clearUserChatHistory: jest.fn().mockResolvedValue({
              success: true,
              message: 'Chat history cleared',
            }),
          },
        },
        {
          provide: JwtService,
          useValue: {
            verifyAsync: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<ChatController>(ChatController);
    chatService = module.get<ChatService>(ChatService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call sendMessage on askShoppingAssistant', async () => {
    const result = await controller.askShoppingAssistant(
      { message: 'Hello' },
      { sub: 'user-uuid-1', email: 'test@example.com' },
    );
    expect(chatService.sendMessage).toHaveBeenCalledWith(
      'Hello',
      'user-uuid-1',
      undefined,
    );
    expect(result.success).toBe(true);
  });

  it('should get chat history', async () => {
    const result = await controller.getChatHistory(
      { sub: 'user-uuid-1', email: 'test@example.com' },
      50,
    );
    expect(chatService.getUserChatHistory).toHaveBeenCalledWith(
      'user-uuid-1',
      50,
      undefined,
    );
    expect(result.total).toBe(1);
  });

  it('should clear chat history', async () => {
    const result = await controller.clearChatHistory(
      { sub: 'user-uuid-1', email: 'test@example.com' },
      undefined,
    );
    expect(chatService.clearUserChatHistory).toHaveBeenCalledWith(
      'user-uuid-1',
      undefined,
    );
    expect(result.success).toBe(true);
  });
});
