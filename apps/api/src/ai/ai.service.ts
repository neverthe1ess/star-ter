import { Injectable } from '@nestjs/common';
import {
  analyzeResults,
  embedText,
  getCategoryByMessage,
  getLocationByMessage,
  getMarketSummary,
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

  async getAreaByMessage(message: string) {
    const [categories, areaList, tables] = await Promise.all([
      this.getCategories(message),
      this.buildAreaList(message),
      this.getTables(message),
    ]);

    console.log('table:', tables);

    if (tables.length === 0) {
      return [];
    }

    const query = await getRecommendCommercialAreasQuery(
      message,
      categories,
      areaList,
      tables,
    );

    console.log('query:', getText(query));

    const result = await this.aiRepository.runSql(getText(query));
    return result;
  }

  async getSummary(areaName: string, metrics: string) {
    const response = await getMarketSummary(areaName, metrics);
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
    if (getText(categoryResponse) === '""') return [];
    const categories = getText(categoryResponse)
      .split(',')
      .map((cat) => cat.trim());

    let categoryList: BusinessCategoryVectorDto[] = [];
    for (const category of categories) {
      const categoryVector = await embedText(category);
      const categoryResults = await this.aiRepository.categorySearchByVector(
        categoryVector.data[0].embedding,
        3,
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
