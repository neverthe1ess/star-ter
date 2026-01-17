import { Injectable } from '@nestjs/common';
import { OpenAiService } from '../providers/openai/openai.service';
import { AiRepository } from '../ai.repository';
import { AreaVectorDto, BusinessCategoryVectorDto } from '../dto/column-vector';

@Injectable()
export class AiContextService {
  // 벡터 검색 신뢰도 임계값
  private readonly DISTANCE_THRESHOLD = 0.4;

  constructor(
    private readonly openAiService: OpenAiService,
    private readonly aiRepository: AiRepository,
  ) {}

  /**
   * 메시지에서 업종 정보 추출
   */
  async getCategories(message: string): Promise<BusinessCategoryVectorDto[]> {
    const categoryResponse =
      await this.openAiService.getCategoryByMessage(message);
    const categoryText = this.openAiService.getText(categoryResponse);
    console.log(`[DEBUG] Extracted Categories: "${categoryText}"`);

    if (categoryText === '""') return [];

    const categories = categoryText.split(',').map((cat) => cat.trim());
    let categoryList: BusinessCategoryVectorDto[] = [];

    for (const category of categories) {
      const categoryVector = await this.openAiService.embedText(category);
      const categoryResults = await this.aiRepository.categorySearchByVector(
        categoryVector.data[0].embedding,
        3,
      );
      categoryList = categoryList.concat(categoryResults);
    }

    return categoryList;
  }

  /**
   * 메시지에서 지역 정보 추출(혜화역 문제를 방지하기 위한 방법, Vector DB에서 가져온 후보 3개가 threshold보다 맞지 않으면 trgm 검색)
   */
  async getAreaInfo(message: string): Promise<AreaVectorDto[]> {
    const areaText = this.openAiService.getText(
      await this.openAiService.getLocationByMessage(message),
    );
    if (areaText === '""') return [];

    const messageAreaList = areaText.split(',').map((area) => area.trim());

    const results = await Promise.all(
      messageAreaList.map(async (area) => {
        const areaVector = await this.openAiService.embedText(area);
        const vectorCandidates = await this.aiRepository.areaSearchByVector(
          areaVector.data[0].embedding,
          3,
        );

        console.log(
          `[DEBUG] Vector search for "${area}":`,
          vectorCandidates.map((c) => `${c.areaName} (dist: ${c.distance})`),
        );

        // 신뢰도 체크: 최상위 결과의 distance가 임계값 초과하면 fallback
        let finalCandidates = vectorCandidates;
        if (
          vectorCandidates.length === 0 ||
          Number(vectorCandidates[0].distance) > this.DISTANCE_THRESHOLD
        ) {
          console.log(
            `[DEBUG] Vector search unreliable (dist > ${this.DISTANCE_THRESHOLD}), trying text fallback...`,
          );
          const textCandidates = await this.aiRepository.areaSearchByText(
            area,
            3,
          );
          if (textCandidates.length > 0) {
            const seenCodes = new Set(textCandidates.map((c) => c.areaCode));
            const mergedCandidates = [
              ...textCandidates,
              ...vectorCandidates.filter((c) => !seenCodes.has(c.areaCode)),
            ];
            finalCandidates = mergedCandidates.slice(0, 3);
            console.log('[DEBUG] Using text search results:', finalCandidates);
          }
        }

        // 좌표 추가
        const candidatesWithCoords = await Promise.all(
          finalCandidates.map(async (candidate) => {
            const coords = await this.aiRepository.getAreaCoordinates(
              candidate.areaCode,
              candidate.areaLevel,
            );
            if (coords) {
              candidate.lat = coords.lat;
              candidate.lng = coords.lng;
            }
            return candidate;
          }),
        );

        return candidatesWithCoords;
      }),
    );

    return results
      .flat()
      .filter((item): item is NonNullable<typeof item> => !!item);
  }
}
