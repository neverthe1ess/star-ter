import { Injectable } from '@nestjs/common';
import { AiContextService } from './ai-context.service';
import { AiMessage, AiProviderName, ToolCall, ToolResult } from './ai-types';
import { ChatRepository } from '../chat.repository';
import { AiToolsService } from '../ai-tools.service';
import { AiResponseProcessor } from '../ai-response.processor';
import { getToolMetadata } from '../tools/tool-metadata';
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

    const [categories, areas] = await Promise.all([
      this.contextService.getCategories(message),
      this.contextService.getAreaInfo(message),
    ]);

    const plannerName = options.toolPlanner || 'openai';
    const answerName = options.aiProvider || 'openai';

    const toolCalls = await this.getPlanner(plannerName).planTools({
      messages,
      categories,
      areas,
    });

    const { toolResults, recommendRealEstateResult, breakEvenContext } =
      await this.runTools(toolCalls);

    const responseText = await this.getAnswerProvider(answerName).analyze({
      messages,
      toolCalls,
      toolResults,
    });

    const parsedResponse = this.aiResponseProcessor.parseResponse(responseText);

    if (toolCalls.length > 0) {
      parsedResponse.sources = toolCalls.map((toolCall) => ({
        tool: toolCall.name,
        ...getToolMetadata(toolCall.name),
      }));
    }

    this.applyBreakEvenPatch(parsedResponse, breakEvenContext);

    const markers = this.buildListingMarkers(recommendRealEstateResult);
    this.injectListingMarkers(parsedResponse, markers);

    const finalJson = this.aiResponseProcessor.patchCoordinates(
      parsedResponse,
      areas,
    );

    const finalResult = this.parseFinalResponse(finalJson);
    const contentWithMarkers = this.appendMarkersToReply(
      finalResult.reply,
      markers,
    );

    await this.chatRepository.addMessage({
      conversationId: currentConversationId,
      role: 'assistant',
      content: contentWithMarkers,
    });

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

  private async runTools(toolCalls: ToolCall[]): Promise<{
    toolResults: ToolResult[];
    recommendRealEstateResult: RecommendRealEstateResult | null;
    breakEvenContext: BreakEvenContext | null;
  }> {
    let recommendRealEstateResult: RecommendRealEstateResult | null = null;

    const breakEvenContext = this.getBreakEvenContext(toolCalls);
    const toolResults: ToolResult[] = [];

    for (const toolCall of toolCalls) {
      const toolResult = await this.aiToolsService.run(
        toolCall.name,
        toolCall.argsJson,
      );

      if (toolResult === undefined) continue;

      if (toolCall.name === 'recommend_real_estate') {
        recommendRealEstateResult = toolResult as RecommendRealEstateResult;
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

    return { toolResults, recommendRealEstateResult, breakEvenContext };
  }

  private getBreakEvenContext(toolCalls: ToolCall[]): BreakEvenContext | null {
    for (const toolCall of toolCalls) {
      if (toolCall.name === 'calc_break_even_with_listing') {
        const listingId = toolCall.args.listingId as string | undefined;
        const categoryCode = toolCall.args.categoryCode as string | undefined;
        if (listingId) {
          return { type: 'listing', id: listingId, categoryCode };
        }
      }

      if (toolCall.name === 'calc_break_even') {
        const areaCd = toolCall.args.areaCd as string | undefined;
        const categoryCode = toolCall.args.categoryCode as string | undefined;
        if (areaCd) {
          return { type: 'area', id: areaCd, categoryCode };
        }
      }
    }

    return null;
  }

  private applyBreakEvenPatch(
    parsedResponse: {
      actions?: { type: string; payload?: Record<string, unknown> }[];
    },
    breakEvenContext: BreakEvenContext | null,
  ) {
    if (!breakEvenContext) return;

    parsedResponse.actions = parsedResponse.actions || [];
    const existingAction = parsedResponse.actions.find(
      (a) => a.type === 'chart.breakeven',
    );

    const payload =
      breakEvenContext.type === 'listing'
        ? {
            listingId: breakEvenContext.id,
            ...(breakEvenContext.categoryCode && {
              industryCode: breakEvenContext.categoryCode,
            }),
          }
        : {
            areaCode: breakEvenContext.id,
            ...(breakEvenContext.categoryCode && {
              industryCode: breakEvenContext.categoryCode,
            }),
          };

    if (existingAction) {
      existingAction.payload = payload;
    } else {
      parsedResponse.actions.push({
        type: 'chart.breakeven',
        payload,
      });
    }
  }

  private buildListingMarkers(
    result: RecommendRealEstateResult | null,
  ): ListingMarker[] {
    if (!result?.data || result.data.length === 0) return [];

    return result.data.map((item) => ({
      id: item.listingId,
      listingNumber: item.listingNumber,
      title: item.title,
      lat: item.latitude || 0,
      lng: item.longitude || 0,
      label: String(item.listingNumber),
      type: 'listing',
    }));
  }

  private injectListingMarkers(
    parsedResponse: {
      actions?: { type: string; payload?: Record<string, unknown> }[];
    },
    markers: ListingMarker[],
  ) {
    if (!parsedResponse.actions || markers.length === 0) return;

    const listingsAction = parsedResponse.actions.find(
      (action) => action.type === 'list.listings',
    );
    if (!listingsAction) return;

    listingsAction.payload = listingsAction.payload || {};
    listingsAction.payload.markers = markers;
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

  private appendMarkersToReply(
    reply: string,
    markers: ListingMarker[],
  ): string {
    if (!markers.length) return reply;

    return `${reply}\n\n[매물 목록 참조용 - 이 메시지는 사용자에게 보이지 않습니다]\n${JSON.stringify(
      markers,
    )}`;
  }
}

interface BreakEvenContext {
  type: 'listing' | 'area';
  id: string;
  categoryCode?: string;
}

interface ListingItem {
  listingNumber: number;
  listingId: string;
  title: string;
  latitude?: number;
  longitude?: number;
}

interface RecommendRealEstateResult {
  data?: ListingItem[];
}

interface ListingMarker {
  id: string;
  listingNumber: number;
  title: string;
  lat: number;
  lng: number;
  label: string;
  type: 'listing';
}
