import { Injectable } from '@nestjs/common';
import { AiRepository } from 'src/ai/ai.repository';
import { AiService } from 'src/ai/ai.service';
import {
  getRecommendCommercialAreasQuery,
  getText,
} from 'src/ai/openAI/openAI';
@Injectable()
export class SearchService {
  constructor(
    private readonly aiService: AiService,
    private readonly aiRepository: AiRepository,
  ) {}

  async getAreaByMessage(message: string) {
    const [categories, areaList, tables] = await Promise.all([
      this.aiService.getCategories(message),
      this.aiService.getAreainfo(message),
      this.aiService.getTables(message),
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
}
