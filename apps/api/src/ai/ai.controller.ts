import {
  Controller,
  Logger,
  Post,
  Body,
  Get,
  Query,
  RequestTimeoutException,
} from '@nestjs/common';
import { AiService } from './ai.service';
import { ToolsRepository } from './tools.repository';

@Controller('ai')
export class AiController {
  private readonly logger = new Logger(AiController.name);
  constructor(
    private readonly aiService: AiService,
    private readonly toolsRepository: ToolsRepository,
  ) {}

  // 대화 히스토리 포함 POST 엔드포인트 (꼬리 질문 지원)
  @Post('/message')
  async chatAIWithHistory(
    @Body()
    body: {
      message: string;
      history?: Array<{ role: 'user' | 'assistant'; content: string }>;
    },
  ) {
    const startTime = Date.now();
    this.logger.log(
      `Received message with history: ${body.message} (${body.history?.length || 0} previous messages)`,
    );

    // 50초 타임아웃 설정
    const TIMEOUT_MS = 50000;
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(
        () =>
          reject(
            new RequestTimeoutException(
              'AI 응답 시간이 초과되었습니다. (50초 제한)',
            ),
          ),
        TIMEOUT_MS,
      ),
    );

    try {
      const response = await Promise.race([
        this.aiService.getAIMessageWithHistory(
          body.message,
          body.history || [],
        ),
        timeoutPromise,
      ]);

      this.logger.log(`Response time: ${Date.now() - startTime} ms`);
      return response;
    } catch (error) {
      this.logger.error(`Error processing message: ${error.message}`);
      throw error;
    }
  }

  // =========================================
  // 차트 데이터 API 엔드포인트(LLM 안에 들어가는 카드)
  // =========================================

  /**
   * 매출/수익 분석 차트 데이터
   * GET /ai/chart/revenue?areaCd=xxx&categoryCode=xxx
   */
  @Get('/chart/revenue')
  async getRevenueChartData(
    @Query('areaCd') areaCd: string,
    @Query('categoryCode') categoryCode?: string,
  ) {
    const result = await this.toolsRepository.estimateRevenueAndCost({
      areaCd,
      categoryCode: categoryCode || undefined,
    });
    return { success: true, data: result.data };
  }

  /**
   * 생존 점수 게이지 데이터
   * GET /ai/chart/survival?areaCd=xxx&categoryCode=xxx
   */
  @Get('/chart/survival')
  async getSurvivalChartData(
    @Query('areaCd') areaCd: string,
    @Query('categoryCode') categoryCode?: string,
  ) {
    const result = await this.toolsRepository.predictSurvivalRate({
      areaCd,
      categoryCode: categoryCode || undefined,
    });
    return { success: true, data: result.data };
  }

  /**
   * 손익분기 분석 차트 데이터
   * GET /ai/chart/breakeven?areaCd=xxx&categoryCode=xxx&listingId=xxx
   */
  @Get('/chart/breakeven')
  async getBreakEvenChartData(
    @Query('areaCd') areaCd?: string,
    @Query('categoryCode') categoryCode?: string,
    @Query('listingId') listingId?: string,
  ) {
    // listingId가 있으면 매물 기반, 없으면 일반 BEP
    if (listingId) {
      const result = await this.toolsRepository.calcBreakEvenWithListing({
        listingId,
        categoryCode: categoryCode || undefined,
      });
      return { success: true, data: result.data };
    } else {
      const result = await this.toolsRepository.calcBreakEven({
        areaCd,
        categoryCode: categoryCode || undefined,
      });
      return { success: true, data: result.data };
    }
  }

  /**
   * 매물 리스트 차트 데이터
   * GET /ai/chart/listings?latitude=xxx&longitude=xxx&maxDeposit=xxx&maxMonthlyRent=xxx
   */
  @Get('/chart/listings')
  async getListingsChartData(
    @Query('latitude') latitude: string,
    @Query('longitude') longitude: string,
    @Query('maxDeposit') maxDeposit?: string,
    @Query('maxMonthlyRent') maxMonthlyRent?: string,
    @Query('limit') limit?: string,
  ) {
    const result = await this.toolsRepository.recommendRealEstate({
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      maxDeposit: maxDeposit ? parseFloat(maxDeposit) : undefined,
      maxMonthlyRent: maxMonthlyRent ? parseFloat(maxMonthlyRent) : undefined,
      limit: limit ? parseInt(limit, 10) : 5,
    });

    // data는 직접 배열로 반환됨
    const listings = Array.isArray(result.data) ? result.data : [];
    return {
      success: true,
      data: {
        listings: listings.map((l) => ({
          id: l.id,
          title: l.title || '매물',
          address: '', // address 필드가 없으므로 빈 문자열
          deposit: (l.deposit || 0) * 10000, // 만원 -> 원 변환
          monthlyRent: (l.monthlyRent || 0) * 10000,
          size: l.size,
          floor: String(l.floor || ''),
          distance: parseFloat(l.distance) * 1000, // km -> m 변환
        })),
        totalCount: listings.length,
      },
    };
  }

  /**
   * 유사 상권 리스트 차트 데이터
   * GET /ai/chart/similar-areas?areaCd=xxx&categoryCode=xxx
   */
  @Get('/chart/similar-areas')
  async getSimilarAreasChartData(
    @Query('areaCd') areaCd: string,
    @Query('categoryCode') categoryCode?: string,
  ) {
    const result = await this.toolsRepository.findSimilarCommercialAreas({
      areaCd, // areaCodes가 아니라 areaCd
      categoryCode: categoryCode || undefined,
    });

    // data 형식을 SimilarAreasCard에 맞게 변환
    const rawData = Array.isArray(result.data) ? result.data : [];
    const targetAreaName = result.meta?.targetAreaName || areaCd;

    return {
      success: true,
      data: {
        targetAreaName,
        similarAreas: rawData.map((item) => ({
          areaCode: item.areaCd, // areaCd -> areaCode로 변환
          areaName: item.areaName,
          similarity: item.similarity * 100, // 0-1 → 0-100
        })),
      },
    };
  }
}
