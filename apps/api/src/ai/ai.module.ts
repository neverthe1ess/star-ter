import { Module } from '@nestjs/common';
import { AiService } from './ai.service';
import { AiController } from './ai.controller';
import { ChatController } from './chat.controller';
import { AiRepository } from './ai.repository';
import { ToolsRepository } from './tools.repository';
import { AiToolsService } from './ai-tools.service';
import { AiResponseProcessor } from './ai-response.processor';
import { OpenAiService } from './openAI/open-ai.service';
import { LocationRecommendModule } from '../location-recommend/location-recommend.module';
import { ChatRepository } from './chat.repository';
import { ChatService } from './chat.service';
import { AiChatOrchestrator } from './core/ai-chat-orchestrator.service';
import { AiContextService } from './core/ai-context.service';
import { OpenAiToolPlanner } from './providers/openai.tool-planner';
import { ClaudeToolPlanner } from './providers/claude.tool-planner';
import { OpenAiAnswerProvider } from './providers/openai.answer-provider';
import { ClaudeAnswerProvider } from './providers/claude.answer-provider';
import { ClaudeService } from '../assistant/claude.service';

@Module({
  imports: [LocationRecommendModule],
  controllers: [AiController, ChatController],
  providers: [
    AiService,
    AiRepository,
    ToolsRepository,
    AiToolsService,
    AiResponseProcessor,
    OpenAiService,
    ClaudeService,
    AiContextService,
    OpenAiToolPlanner,
    ClaudeToolPlanner,
    OpenAiAnswerProvider,
    ClaudeAnswerProvider,
    AiChatOrchestrator,
    ChatRepository,
    ChatService,
  ],
  exports: [AiService, AiRepository, AiChatOrchestrator],
})
export class AiModule {}
