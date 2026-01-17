/**
 * Assistant Service - Claude 기반 채팅 비즈니스 로직
 * Unified AI orchestrator wrapper
 */
import { Injectable } from '@nestjs/common';
import { AiChatOrchestrator } from '../ai/core/ai-chat-orchestrator.service';

@Injectable()
export class AssistantService {
  constructor(private readonly aiChatOrchestrator: AiChatOrchestrator) {
    console.log('[AssistantService] Claude Assistant initialized');
  }

  async getMessageWithHistory(
    message: string,
    userId: string,
    conversationId?: string,
  ) {
    return this.aiChatOrchestrator.handleMessage(
      userId,
      conversationId || null,
      message,
      {
        aiProvider: 'claude',
        toolPlanner: 'openai',
      },
    );
  }
}
