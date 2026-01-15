import { Injectable } from '@nestjs/common';
import { ChatRepository } from './chat.repository';
import { AiService } from './ai.service';

@Injectable()
export class ChatService {
  constructor(
    private readonly chatRepository: ChatRepository,
    private readonly aiService: AiService,
  ) {}

  async handleChatMessage(
    userId: string,
    conversationId: string | null,
    message: string,
  ) {
    if (!conversationId) {
      conversationId = await this.chatRepository
        .createConversation({
          userId: userId,
          title: message.slice(0, 50), // 첫 메시지 일부를 제목으로 사용
        })
        .then((conv) => conv.id);
    }

    if (!conversationId) {
      throw new Error('Failed to create conversation');
    }

    const conversation =
      await this.chatRepository.getConversation(conversationId);

    if (conversation?.userId !== userId) {
      throw new Error('Access denied to this conversation');
    }

    await this.chatRepository.addMessage({
      conversationId: conversationId,
      role: 'user',
      content: message,
    });

    const aiResponse = await this.aiService.getAIMessageWithHistory(
      message,
      conversation?.previousResponseId || null,
    );

    if (!conversation.previousResponseId) {
      await this.chatRepository.updateConversation(conversationId, {
        previousResponseId: aiResponse.previousResponseId,
      });
    }

    await this.chatRepository.addMessage({
      conversationId: conversationId,
      role: 'assistant',
      content: aiResponse.result,
    });

    return aiResponse;
  }

  async getUserConversations(userId: string) {
    return this.chatRepository
      .listConversationsByUser(userId)
      .then((conversations) =>
        conversations.map((conv) => ({
          id: conv.id,
          title: conv.title,
        })),
      );
  }

  async getConversationHistory(userId: string, conversationId: string) {
    const conversation =
      await this.chatRepository.getConversation(conversationId);
    if (!conversation || conversation.userId !== userId) {
      throw new Error('Conversation not found or access denied');
    }

    return this.chatRepository
      .listMessagesByConversation(conversationId)
      .then((messages) =>
        messages.map((msg) => ({
          role: msg.role,
          content: msg.content,
        })),
      );
  }
}
