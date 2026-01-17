import { Injectable } from '@nestjs/common';
import { AiContextService } from './ai-context.service';
import { AiMessage, AiProviderName, ToolCall, ToolResult } from './ai-types';
import { ChatRepository } from '../chat.repository';
import { AiToolsService } from '../ai-tools.service';
import { AiResponseProcessor } from '../ai-response.processor';
import { getToolMetadata } from '../tools/tool-metadata';
import { ActionMapperService } from './action-mapper.service';
import { OpenAiToolPlanner } from '../providers/openai.tool-planner';
import { ClaudeToolPlanner } from '../providers/claude.tool-planner';
import { OpenAiAnswerProvider } from '../providers/openai.answer-provider';
import { ClaudeAnswerProvider } from '../providers/claude.answer-provider';

export interface AiChatOptions {
  aiProvider?: AiProviderName;
  toolPlanner?: AiProviderName;
}

export interface AiChatResponse {
  reply: string;
  actions: unknown[];
  sources?: { tool: string; displayName: string; source: string }[];
  conversationId: string;
}

@Injectable()
export class AiChatOrchestrator {
  private readonly MAX_HISTORY_LENGTH = 50;

  constructor(
    private readonly chatRepository: ChatRepository,
    private readonly contextService: AiContextService,
    private readonly aiToolsService: AiToolsService,
    private readonly aiResponseProcessor: AiResponseProcessor,
    private readonly actionMapper: ActionMapperService,
    private readonly openAiPlanner: OpenAiToolPlanner,
    private readonly claudePlanner: ClaudeToolPlanner,
    private readonly openAiAnswerProvider: OpenAiAnswerProvider,
    private readonly claudeAnswerProvider: ClaudeAnswerProvider,
  ) {}

  async handleMessage(
    userId: string,
    conversationId: string | null,
    message: string,
    options: AiChatOptions = {},
  ): Promise<AiChatResponse> {
    const startTime = Date.now();
    console.log(
      `[AiChatOrchestrator] Starting handleMessage for user ${userId}`,
    );

    const currentConversationId = await this.resolveConversationId(
      userId,
      conversationId,
      message,
    );

    const historyMessages =
      await this.chatRepository.listMessagesByConversation(
        currentConversationId,
        { take: this.MAX_HISTORY_LENGTH, order: 'asc' },
      );
    const history: AiMessage[] = historyMessages.map((msg) => ({
      role: msg.role as 'user' | 'assistant',
      content: msg.content,
    }));

    await this.chatRepository.addMessage({
      conversationId: currentConversationId,
      role: 'user',
      content: message,
    });

    const messages: AiMessage[] = [
      ...history,
      { role: 'user', content: message },
    ];

    console.log(
      `[AiChatOrchestrator] Context extraction start (${Date.now() - startTime}ms)`,
    );
    const [categories, areas] = await Promise.all([
      this.contextService.getCategories(message),
      this.contextService.getAreaInfo(message),
    ]);
    console.log(
      `[AiChatOrchestrator] Context extraction end (${Date.now() - startTime}ms)`,
    );

    const plannerName = options.toolPlanner || 'openai';
    const answerName = options.aiProvider || 'openai';

    console.log(
      `[AiChatOrchestrator] Tool planning start with ${plannerName} (${Date.now() - startTime}ms)`,
    );
    const toolCalls = await this.getPlanner(plannerName).planTools({
      messages,
      categories,
      areas,
    });
    console.log(
      `[AiChatOrchestrator] Tool planning end. Calls: ${toolCalls.length} (${Date.now() - startTime}ms)`,
    );
    if (toolCalls.length > 0) {
      console.log(
        `[AiChatOrchestrator] Tool calls: ${JSON.stringify(
          toolCalls.map((t) => t.name),
        )}`,
      );
    }

    console.log(
      `[AiChatOrchestrator] Tool execution start (${Date.now() - startTime}ms)`,
    );
    const toolResults = await this.runTools(toolCalls);
    console.log(
      `[AiChatOrchestrator] Tool execution end (${Date.now() - startTime}ms)`,
    );

    console.log(
      `[AiChatOrchestrator] Answer generation start with ${answerName} (${Date.now() - startTime}ms)`,
    );
    const responseText = await this.getAnswerProvider(answerName).analyze({
      messages,
      toolCalls,
      toolResults,
    });
    console.log(
      `[AiChatOrchestrator] Answer generation end (${Date.now() - startTime}ms)`,
    );

    const actions = this.actionMapper.buildActions(toolCalls, toolResults);
    const sources =
      toolCalls.length > 0
        ? toolCalls.map((toolCall) => ({
            tool: toolCall.name,
            ...getToolMetadata(toolCall.name),
          }))
        : undefined;

    const finalJson = this.aiResponseProcessor.patchCoordinates(
      { reply: responseText, actions, sources },
      areas,
    );

    const finalResult = this.parseFinalResponse(finalJson);
    const markersForHistory = this.extractMarkersFromActions(
      finalResult.actions,
    );
    const contentWithMarkers = this.appendMarkersToReply(
      finalResult.reply,
      markersForHistory,
    );

    await this.chatRepository.addMessage({
      conversationId: currentConversationId,
      role: 'assistant',
      content: contentWithMarkers,
    });

    const totalTime = Date.now() - startTime;
    console.log(
      `[AiChatOrchestrator] handleMessage completed in ${totalTime}ms`,
    );

    return {
      reply: finalResult.reply,
      actions: finalResult.actions,
      sources: finalResult.sources,
      conversationId: currentConversationId,
    };
  }

  private async resolveConversationId(
    userId: string,
    conversationId: string | null,
    message: string,
  ): Promise<string> {
    if (!conversationId) {
      const conversation = await this.chatRepository.createConversation({
        userId,
        title: message.slice(0, 50),
      });
      return conversation.id;
    }

    const conversation =
      await this.chatRepository.getConversation(conversationId);
    if (!conversation || conversation.userId !== userId) {
      throw new Error('Conversation not found or access denied');
    }

    return conversationId;
  }

  private getPlanner(
    name: AiProviderName,
  ): OpenAiToolPlanner | ClaudeToolPlanner {
    return name === 'claude' ? this.claudePlanner : this.openAiPlanner;
  }

  private getAnswerProvider(
    name: AiProviderName,
  ): OpenAiAnswerProvider | ClaudeAnswerProvider {
    return name === 'claude'
      ? this.claudeAnswerProvider
      : this.openAiAnswerProvider;
  }

  private async runTools(toolCalls: ToolCall[]): Promise<ToolResult[]> {
    const toolResults: ToolResult[] = [];

    for (const toolCall of toolCalls) {
      console.log(`[AiChatOrchestrator] Executing tool: ${toolCall.name}`);
      const toolResult = await this.aiToolsService.run(
        toolCall.name,
        toolCall.argsJson,
      );

      if (toolResult === undefined) {
        console.log(
          `[AiChatOrchestrator] Tool ${toolCall.name} returned undefined, skipping result`,
        );
        continue;
      }

      toolResults.push({
        toolCallId: toolCall.id,
        name: toolCall.name,
        output: toolResult,
        outputJson: JSON.stringify(toolResult, (k, v) =>
          this.aiResponseProcessor.safeBigIntStringify(k, v),
        ),
      });
    }

    return toolResults;
  }

  private parseFinalResponse(finalJson: string): {
    reply: string;
    actions: unknown[];
    sources?: { tool: string; displayName: string; source: string }[];
  } {
    try {
      const parsed = JSON.parse(finalJson) as {
        reply?: string;
        actions?: unknown[];
        sources?: { tool: string; displayName: string; source: string }[];
      };
      return {
        reply: parsed.reply || '',
        actions: parsed.actions || [],
        sources: parsed.sources,
      };
    } catch {
      return { reply: finalJson, actions: [] };
    }
  }

  private appendMarkersToReply(reply: string, markers: unknown[]): string {
    if (!markers.length) return reply;

    return `${reply}\n\n[매물 목록 참조용 - 이 메시지는 사용자에게 보이지 않습니다]\n${JSON.stringify(
      markers,
    )}`;
  }

  private extractMarkersFromActions(actions: unknown[]): unknown[] {
    for (const action of actions) {
      if (!action || typeof action !== 'object') continue;
      const actionRecord = action as { type?: string; payload?: unknown };
      if (actionRecord.type !== 'list.listings') continue;
      const payload = actionRecord.payload as { markers?: unknown };
      if (Array.isArray(payload?.markers)) {
        return payload.markers;
      }
    }

    return [];
  }
}
