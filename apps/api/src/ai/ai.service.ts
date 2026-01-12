import { Injectable } from '@nestjs/common';
import {
  analyzeResults,
  embedText,
  getCategoryByMessage,
  getLocationByMessage,
  getAiAnalysis,
  getRealEstateSummary,
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
    const toolCallResponse = await toolCallAi(input, categories, areaList);
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
    // Structured Outputs: output_text에 JSON 문자열 ({ reply, actions }) 반환
    const finalText = getText(analyzeResult);

    try {
      const parsedFn = JSON.parse(finalText);
      if (parsedFn.actions && Array.isArray(parsedFn.actions)) {
        let modified = false;
        parsedFn.actions.forEach((action: any) => {
          if (
            action.type === 'real_estate.recommend' &&
            (!action.payload?.lat || !action.payload?.lng)
          ) {
            const targetAreaName = action.payload?.areaName;
            const foundArea =
              areaList.find((a) => a.areaName === targetAreaName) ||
              areaList[0];

            if (foundArea && foundArea.lat && foundArea.lng) {
              action.payload = {
                ...action.payload,
                lat: foundArea.lat,
                lng: foundArea.lng,
              };
              modified = true;
            }
          }
        });

        if (modified) {
          return JSON.stringify(parsedFn);
        }
      }
    } catch (e) {
      console.error(
        '[AiService] Failed to patch coordinates in legacy function:',
        e,
      );
    }

    return finalText;
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
        output: JSON.stringify(toolResult, safeBigIntStringify),
      });
    }

    console.log('[AiService] Calling analyzeResults...');
    const analyzeResult = await analyzeResults(input);

    // 디버깅: LLM 응답 출력
    const responseText = getText(analyzeResult);
    console.log('[AI Response]', responseText);

    // Structured Outputs: output_text에 JSON 문자열 ({ reply, actions }) 반환
    try {
      let parsedFn;
      try {
        parsedFn = JSON.parse(responseText);
      } catch (e) {
        // 중괄호 카운팅을 통한 첫 번째 JSON 추출 시도
        try {
          const firstOpen = responseText.indexOf('{');
          if (firstOpen === -1) throw e;

          let balance = 0;
          let end = -1;
          let inString = false;
          let escape = false;

          for (let i = firstOpen; i < responseText.length; i++) {
            const char = responseText[i];

            if (escape) {
              escape = false;
              continue;
            }

            if (char === '\\') {
              escape = true;
              continue;
            }

            if (char === '"') {
              inString = !inString;
              continue;
            }

            if (!inString) {
              if (char === '{') {
                balance++;
              } else if (char === '}') {
                balance--;
                if (balance === 0) {
                  end = i;
                  break;
                }
              }
            }
          }

          if (end !== -1) {
            const jsonStr = responseText.substring(firstOpen, end + 1);
            parsedFn = JSON.parse(jsonStr);
            console.log('[AiService] Successfully extracted first JSON object');
          } else {
            throw e;
          }
        } catch (extractError) {
          throw e; // 추출 실패 시 원본 에러 던짐
        }
      }

      if (parsedFn.actions && Array.isArray(parsedFn.actions)) {
        let modified = false;
        parsedFn.actions.forEach((action: any) => {
          // 모든 액션에 대해 좌표 보정 시도 (lat, lng가 있고 areaName이 있는 경우)
          if (action.payload?.areaName) {
            const targetAreaName = action.payload.areaName;

            // 정확한 이름 일치 우선, 없으면 areaList 첫 번째 사용
            // 단, areaList가 비어있으면 보정 불가
            const foundArea =
              areaList.find((a) => a.areaName === targetAreaName) ||
              areaList[0];

            // foundArea가 있고, 이름이 일치하며, 좌표가 유효하다면 덮어쓰기
            // 이름이 다르면(즉, 추천 로직에 의해 전혀 다른 지역이 선택된 경우) 덮어쓰지 않음
            if (
              foundArea &&
              foundArea.areaName === targetAreaName &&
              foundArea.lat &&
              foundArea.lng
            ) {
              // 기존 좌표가 없거나, AI가 생성한 좌표가 이상할 수 있으므로 항상 신뢰할 수 있는 DB 좌표로 보정
              // 단, 이미 정확한 좌표가 있는 경우(예: 매물 위치 등)는 제외해야 할 수도 있으나,
              // 현재 상황(상권 중심점)에서는 DB 좌표가 더 정확함.
              if (
                !action.payload.lat ||
                !action.payload.lng ||
                action.type === 'ui.open_panel'
              ) {
                action.payload.lat = foundArea.lat;
                action.payload.lng = foundArea.lng;
                // zoom 레벨도 필요시 보정 (예: 상권이면 15)
                if (!action.payload.zoom) {
                  action.payload.zoom = 15;
                }
                console.log(
                  `[AiService] Patched coordinates for ${action.type} (${targetAreaName}):`,
                  foundArea.lat,
                  foundArea.lng,
                );
                modified = true;
              }
            }
          }
        });

        if (modified) {
          return JSON.stringify(parsedFn);
        }
      }
    } catch (e) {
      console.error('[AiService] Failed to patch coordinates:', e);
    }

    return responseText;
  }

  async getAnalysis(topic: string, areaName: string, metrics: string) {
    const response = await getAiAnalysis(topic, areaName, metrics);
    return getText(response);
  }

  async getRealEstateSummary(metrics: string) {
    const response = await getRealEstateSummary(metrics);
    return getText(response);
  }

  async buildAreaList(message: string) {
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
    return results;
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

  async getTables(message: string) {
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
