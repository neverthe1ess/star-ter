import { Injectable } from '@nestjs/common';
import {
  analyzeResults,
  embedText,
  getCategoryByMessage,
  getLocationByMessage,
  getTablesByMessage,
  getText,
  toolCallAi,
} from './openAI/openAI';
import { AiRepository } from './ai.repository';
import { BusinessCategoryVectorDto } from './dto/column-vector';
import { ResponseInputItem } from 'openai/resources/responses/responses.js';
import { AiToolsService } from './ai-tools.service';
import { AiResponseProcessor } from './ai-response.processor';

@Injectable()
export class AiService {
  constructor(
    private readonly aiRepository: AiRepository,
    private readonly aiToolsService: AiToolsService,
    private readonly aiResponseProcessor: AiResponseProcessor,
  ) {}

  // 대화 히스토리 포함 메시지 처리 함수 (꼬리 질문 지원)
  private readonly MAX_HISTORY_LENGTH = 10;

  async getAIMessageWithHistory(
    message: string,
    history: Array<{ role: 'user' | 'assistant'; content: string }>,
  ): Promise<string> {
    const [categories, areaList] = await Promise.all([
      this.getCategories(message),
      this.getAreaInfo(message),
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

    const toolCallResponse = await toolCallAi(input, categories, areaList);
    console.log(
      '[AiService] Tool call response:',
      JSON.stringify(toolCallResponse.output, null, 2),
    );
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
        output: JSON.stringify(toolResult, (k, v) =>
          this.aiResponseProcessor.safeBigIntStringify(k, v),
        ),
      });
    }

    console.log('[AiService] Calling analyzeResults...');
    const analyzeResult = await analyzeResults(input);

    const responseText = getText(analyzeResult);
    console.log('[AI Response]', responseText);

    // Use processor for parsing and patching
    const parsedResponse = this.aiResponseProcessor.parseResponse(responseText);
    const finalJson = this.aiResponseProcessor.patchCoordinates(
      parsedResponse,
      areaList,
    );

    return finalJson;
  }

  async getAreaInfo(message: string) {
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

        if (first) {
          console.log(
            `[DEBUG] Area found in vector DB: ${first.areaName} (${first.areaCode}, ${first.areaLevel})`,
          );
          const coords = await this.aiRepository.getAreaCoordinates(
            first.areaCode,
            first.areaLevel,
          );
          console.log(`[DEBUG] Coords fetched for ${first.areaName}:`, coords);
          if (coords) {
            first.lat = coords.lat;
            first.lng = coords.lng;
          }
        }
        return first;
      }),
    );

    // Filter out undefined results to prevent errors during coordinate patching
    return results.filter((item): item is NonNullable<typeof item> => !!item);
  }

  async getCategories(message: string) {
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
  //TODO: Deprecated 정훈이한테 물어보고 지우기
  async getTables(message: string) {
    const tableList = await getTablesByMessage(message);
    if (getText(tableList) === '""') return [];
    const categories = getText(tableList)
      .split(',')
      .map((cat) => cat.trim());
    return categories;
  }
}
