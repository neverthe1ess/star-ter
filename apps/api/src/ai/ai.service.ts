import { Injectable } from '@nestjs/common';
import {
  analyzeResults,
  embedText,
  getCategoryByMessage,
  getLocationByMessage,
  getAiAnalysis,
  getRealEstateSummary,
  getRecommendCommercialAreasQuery,
  getTablesByMessage,
  getText,
  toolCallAi,
} from './openAI/openAI';
import { AiRepository } from './ai.repository';
import { BusinessCategoryVectorDto } from './dto/column-vector';
import { ResponseInputItem } from 'openai/resources/responses/responses.js';
import { AiToolsService } from './ai-tools.service';

@Injectable()
export class AiService {
  constructor(
    private readonly aiRepository: AiRepository,
    private readonly aiToolsService: AiToolsService,
  ) {}

  // 기존 단일 메시지 처리 함수 (하위 호환성 유지)
  async getAIMessage(message: string): Promise<string> {
    const [categories, areaList] = await Promise.all([
      this.getCategories(message),
      this.buildAreaList(message),
    ]);

    const input: ResponseInputItem[] = [{ role: 'user', content: message }];
    const toolCallResponse = await toolCallAi(message, categories, areaList);
    input.push(...toolCallResponse.output);

    for (const toolCall of toolCallResponse.output) {
      if (toolCall.type !== 'function_call') continue;
      const toolResult = await this.aiToolsService.run(
        toolCall.name,
        toolCall.arguments,
      );

      if (toolResult === undefined) {
        continue;
      }

      input.push({
        type: 'function_call_output',
        call_id: toolCall.call_id,
        output: JSON.stringify(toolResult, safeBigIntStringify),
      });
    }

    const analyzeResult = await analyzeResults(input);

    // Structured Outputs: output_text에 JSON 문자열 ({ reply, actions }) 반환
    return getText(analyzeResult);
  }

  // 대화 히스토리 포함 메시지 처리 함수 (꼬리 질문 지원)
  private readonly MAX_HISTORY_LENGTH = 10;
  //TODO: 원래는 getAIMessage를 쓰려고 하였으나, 변경이 많이 필요하여 별도의 함수로 재생성 미안하다 정훈아
  async getAIMessageWithHistory(
    message: string,
    history: Array<{ role: 'user' | 'assistant'; content: string }>,
  ): Promise<string> {
    const [categories, areaList] = await Promise.all([
      this.getCategories(message),
      this.buildAreaList(message),
    ]);

    // 입력 배열 구성 (히스토리 포함)
    const input: ResponseInputItem[] = [];

    // 이전 대화 히스토리 추가 (최대 10개, 너무 길면 토큰 초과 방지)
    if (history && history.length > 0) {
      const recentHistory = history.slice(-this.MAX_HISTORY_LENGTH);
      for (const msg of recentHistory) {
        input.push({
          role: msg.role,
          content: msg.content,
        });
      }
    }

    // 현재 사용자 메시지 추가
    input.push({ role: 'user', content: message });

    const toolCallResponse = await toolCallAi(message, categories, areaList);
    input.push(...toolCallResponse.output);

    for (const toolCall of toolCallResponse.output) {
      if (toolCall.type !== 'function_call') continue;
      const toolResult = await this.aiToolsService.run(
        toolCall.name,
        toolCall.arguments,
      );

      if (toolResult === undefined) {
        continue;
      }

      input.push({
        type: 'function_call_output',
        call_id: toolCall.call_id,
        output: JSON.stringify(toolResult, safeBigIntStringify),
      });
    }

    const analyzeResult = await analyzeResults(input);

    // 디버깅: LLM 응답 출력
    const responseText = getText(analyzeResult);
    console.log('[AI Response]', responseText);

    // Structured Outputs: output_text에 JSON 문자열 ({ reply, actions }) 반환
    return responseText;
  }

  async getAreaByMessage(message: string) {
    const [categories, areaList, tables] = await Promise.all([
      this.getCategories(message),
      this.buildAreaList(message),
      this.getTables(message),
    ]);

    if (tables.length === 0) return [];

    const query = await getRecommendCommercialAreasQuery(
      message,
      categories,
      areaList,
      tables,
    );
    console.log('Generated SQL:', getText(query));
    const result = await this.aiRepository.runSql(getText(query));
    return result;
  }

  async getAnalysis(topic: string, areaName: string, metrics: string) {
    const response = await getAiAnalysis(topic, areaName, metrics);
    return getText(response);
  }

  async getRealEstateSummary(metrics: string) {
    const response = await getRealEstateSummary(metrics);
    return getText(response);
  }

  private async buildAreaList(message: string) {
    const areaText = getText(await getLocationByMessage(message));
    if (areaText === '""') return [];
    const messageAreaList = areaText.split(',').map((area) => area.trim());

    const results = await Promise.all(
      messageAreaList.map(async (area) => {
        const areaVector = await embedText(area);
        const [first] = await this.aiRepository.areaSearchByVector(
          areaVector.data[0].embedding,
          1,
        );
        return first;
      }),
    );
    return results;
  }

  private async getCategories(message: string) {
    const categoryResponse = await getCategoryByMessage(message);
    const categoryText = getText(categoryResponse);
    console.log(
      `[DEBUG] Extracted Categories for message "${message}":`,
      categoryText,
    );

    if (categoryText === '""') return [];

    const categories = categoryText.split(',').map((cat) => cat.trim());

    let categoryList: BusinessCategoryVectorDto[] = [];
    for (const category of categories) {
      const categoryVector = await embedText(category);
      // console.log(`[DEBUG] Embedding for ${category} generated.`);

      const categoryResults = await this.aiRepository.categorySearchByVector(
        categoryVector.data[0].embedding,
        3,
      );
      console.log(
        `[DEBUG] Vector Search Results for "${category}":`,
        JSON.stringify(categoryResults, null, 2),
      );

      categoryList = categoryList.concat(categoryResults);
    }
    return categoryList;
  }

  private async getTables(message: string) {
    const tableList = await getTablesByMessage(message);
    if (getText(tableList) === '""') return [];
    const categories = getText(tableList)
      .split(',')
      .map((cat) => cat.trim());
    return categories;
  }
}

function safeBigIntStringify(key: string, value: any) {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return typeof value === 'bigint' ? value.toString() : value;
}
