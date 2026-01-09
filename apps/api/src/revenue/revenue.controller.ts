import { Controller, Get, Query } from '@nestjs/common';
import { RevenueService } from './revenue.service';
import {
  GetRevenueQueryDto,
  GetRevenueRankingQueryDto,
  RevenueRankingResponseDto,
  RevenueResponseDto,
  MarketAnalyticsResponseDto,
  RevenueLevel,
  AverageSalesRankingResponseDto,
} from './dto/revenue.dto';

@Controller('revenue')
export class RevenueController {
  constructor(private readonly revenueService: RevenueService) {}

  @Get()
  getRevenue(@Query() query: GetRevenueQueryDto): Promise<RevenueResponseDto> {
    return this.revenueService.getRevenue(query);
  }

  @Get('ranking')
  getRevenueRanking(
    @Query() query: GetRevenueRankingQueryDto,
  ): Promise<RevenueRankingResponseDto> {
    return this.revenueService.getRevenueRanking(query);
  }

  @Get('ranking/growth')
  getGrowthRanking(
    @Query('level') level?: string,
    @Query('keyword') keyword?: string, // 추가
  ): Promise<RevenueRankingResponseDto> {
    return this.revenueService.getGrowthRanking(
      (level as RevenueLevel) || 'commercial',
      keyword,
    );
  }

  // 평균 매출 순 / 매출 성장 순
  @Get('ranking/average')
  getAverageSalesRanking(
    @Query('level') level?: string,
    @Query('industryCode') industryCode?: string,
    @Query('sortBy') sortBy?: 'average' | 'growth',
    @Query('keyword') keyword?: string, // 추가
  ): Promise<AverageSalesRankingResponseDto> {
    return this.revenueService.getAverageSalesRanking(
      (level as RevenueLevel) || 'commercial',
      industryCode,
      sortBy || 'average',
      keyword,
    );
  }

  @Get('analytics')
  getMarketAnalytics(
    @Query() query: GetRevenueQueryDto,
  ): Promise<MarketAnalyticsResponseDto> {
    return this.revenueService.getMarketAnalytics(query);
  }
}
