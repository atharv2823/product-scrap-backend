import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';

describe('ChatController', () => {
  let controller: ChatController;
  let mockSendMessage: jest.Mock;
  let mockGetUserChatHistory: jest.Mock;
  let mockClearUserChatHistory: jest.Mock;

  beforeEach(async () => {
    mockSendMessage = jest.fn().mockResolvedValue({
      success: true,
      answer: 'Test Answer',
    });
    mockGetUserChatHistory = jest.fn().mockResolvedValue({
      total: 1,
      messages: [
        {
          id: 'msg-1',
          message: 'Hello',
          response: 'Hi',
        },
      ],
    });
    mockClearUserChatHistory = jest.fn().mockResolvedValue({
      success: true,
      message: 'Chat history cleared',
    });

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ChatController],
      providers: [
        {
          provide: ChatService,
          useValue: {
            sendMessage: mockSendMessage,
            getUserChatHistory: mockGetUserChatHistory,
            clearUserChatHistory: mockClearUserChatHistory,
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
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call sendMessage on askShoppingAssistant', async () => {
    const result = await controller.askShoppingAssistant(
      { message: 'Hello' },
      { sub: 'user-uuid-1', email: 'test@example.com' },
    );
    expect(mockSendMessage).toHaveBeenCalledWith(
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
    expect(mockGetUserChatHistory).toHaveBeenCalledWith(
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
    expect(mockClearUserChatHistory).toHaveBeenCalledWith(
      'user-uuid-1',
      undefined,
    );
    expect(result.success).toBe(true);
  });
});
