/**
 * Claude Service - Anthropic Claude SDK 래퍼
 * Tool Calling과 결과 분석을 담당
 */
import { Injectable } from '@nestjs/common';
import Anthropic from '@anthropic-ai/sdk';
import {
  AreaVectorDto,
  BusinessCategoryVectorDto,
} from '../ai/dto/column-vector';

// Claude Tool 정의 타입
interface ClaudeTool {
  name: string;
  description: string;
  input_schema: {
    type: 'object';
    properties: Record<string, unknown>;
    required?: string[];
  };
}

// Tool 호출 결과 타입
export interface ClaudeToolCall {
  id: string;
  name: string;
  arguments: Record<string, unknown>;
}

@Injectable()
export class ClaudeService {
  private client: Anthropic;

  // Claude 모델 (빠르고 저렴한 Haiku)
  private readonly MODEL = 'claude-haiku-4-5';

  constructor() {
    this.client = new Anthropic();
  }

  /**
   * Tool Calling 수행 (1차 호출)
   * 사용자 메시지를 분석하여 적절한 Tool을 선택
   * @returns 원본 content와 추출된 toolCalls
   */
  async toolCall(
    messages: Anthropic.MessageParam[],
    systemPrompt: string,
    tools: ClaudeTool[],
  ): Promise<{
    content: Anthropic.ContentBlock[];
    toolCalls: ClaudeToolCall[];
  }> {
    const response = await this.client.messages.create({
      model: this.MODEL,
      max_tokens: 3000,
      system: systemPrompt,
      messages,
      tools,
    });

    console.log(
      `[ClaudeService] Tool call stop_reason: ${response.stop_reason}`,
    );
    console.log(`[ClaudeService] Usage:`, response.usage);

    // Tool 호출 추출 (tool_use 블록)
    const toolCalls: ClaudeToolCall[] = response.content
      .filter(
        (block): block is Anthropic.ToolUseBlock => block.type === 'tool_use',
      )
      .map((block) => ({
        id: block.id,
        name: block.name,
        arguments: block.input as Record<string, unknown>,
      }));

    console.log(`[ClaudeService] Tool calls: ${toolCalls.length}`);

    // 원본 content와 추출된 toolCalls 함께 반환
    return {
      content: response.content,
      toolCalls,
    };
  }

  /**
   * 결과 분석 및 최종 응답 생성 (2차 호출)
   * Tool을 사용하여 JSON 출력을 강제
   */
  async analyzeResults(
    messages: Anthropic.MessageParam[],
    systemPrompt: string,
  ): Promise<string> {
    // JSON 출력을 강제하기 위한 응답 생성 Tool
    const responseTool: ClaudeTool = {
      name: 'generate_response',
      description: `사용자에게 응답을 생성합니다.

[중요] actions 배열 규칙:
- predict_survival_rate 호출됨 → actions에 {type: "chart.survival", payload: {areaCode, industryCode}} 추가
- get_commercial_risk 호출됨 → actions에 {type: "chart.survival", payload: {areaCode}} 추가
- find_similar_commercial_areas 호출됨 → actions에 {type: "list.similar_areas", payload: {areaCode}} 추가
- estimate_revenue_and_cost 호출됨 → actions에 {type: "chart.revenue", payload: {areaCode, industryCode}} 추가
- recommend_real_estate 호출됨 → actions에 {type: "list.listings", payload: {lat, lng}} 추가
- calc_break_even 호출됨 → actions에 {type: "chart.breakeven", payload: {areaCode}} 추가
- get_industry_commercial_summary, get_store 호출됨 → actions는 빈 배열 []

Tool 호출 메시지에서 areaCd 값을 찾아 areaCode로, categoryCode 값을 industryCode로 복사하세요.`,
      input_schema: {
        type: 'object',
        properties: {
          reply: {
            type: 'string',
            description: '사용자에게 보여줄 응답 텍스트 (마크다운 가능)',
          },
          actions: {
            type: 'array',
            description:
              '호출된 Tool에 따라 필수로 추가해야 하는 UI 액션. Tool이 get_industry_commercial_summary나 get_store면 빈 배열.',
            items: {
              type: 'object',
              properties: {
                type: {
                  type: 'string',
                  description:
                    'chart.survival, chart.revenue, chart.breakeven, list.similar_areas, list.listings 중 하나',
                },
                payload: {
                  type: 'object',
                  description: 'areaCode, industryCode, lat, lng, listingId 등',
                },
              },
              required: ['type', 'payload'],
            },
          },
        },
        required: ['reply', 'actions'],
      },
    };

    const response = await this.client.messages.create({
      model: this.MODEL,
      max_tokens: 2000,
      system: systemPrompt,
      messages,
      tools: [responseTool],
      tool_choice: { type: 'tool', name: 'generate_response' },
    });

    console.log(`[ClaudeService] Analyze stop_reason: ${response.stop_reason}`);
    console.log(`[ClaudeService] Usage:`, response.usage);

    // tool_use 블록에서 JSON 추출
    const toolUseBlock = response.content.find(
      (block): block is Anthropic.ToolUseBlock => block.type === 'tool_use',
    );

    if (toolUseBlock && toolUseBlock.name === 'generate_response') {
      const result = toolUseBlock.input as {
        reply: string;
        actions: unknown[];
      };
      console.log(
        '[ClaudeService] Tool response received:',
        JSON.stringify(result).substring(0, 200),
      );
      return JSON.stringify(result);
    }

    // Fallback: 텍스트 블록
    const textBlock = response.content.find(
      (block): block is Anthropic.TextBlock => block.type === 'text',
    );
    return textBlock?.text || '';
  }

  /**
   * 업종 벡터를 프롬프트 문자열로 변환
   */
  formatCategoryVectors(categories: BusinessCategoryVectorDto[]): string {
    return categories
      .map(
        (cat) =>
          `svc_induty_cd: ${cat.code}, svc_induty_cd_nm: ${cat.categoryName}`,
      )
      .join('\n');
  }

  /**
   * 지역 벡터를 프롬프트 문자열로 변환
   */
  formatAreaVectors(areas: AreaVectorDto[]): string {
    return areas
      .map(
        (area) =>
          `area_name: ${area.areaName}, area_level: ${area.areaLevel}, area_code: ${area.areaCode}, lat: ${area.lat || 'null'}, lng: ${area.lng || 'null'}`,
      )
      .join('\n');
  }
}
