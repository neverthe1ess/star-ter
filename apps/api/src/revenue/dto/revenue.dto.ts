import { IsIn, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export const revenueLevels = [
  'city',
  'gu',
  'dong',
  'backarea',
  'commercial',
] as const;
export type RevenueLevel = (typeof revenueLevels)[number];

export class RevenueItemDto {
  industryCode: string;
  industryName: string;
  amount: number;
  count: number;
}

export class RevenueResponseDto {
  level: RevenueLevel;
  code: string;
  totalAmount: number;
  totalCount: number;
  items: RevenueItemDto[];
}

export class RevenueRankingItemDto {
  code: string;
  name: string;
  amount: number;
  count: number;
  changeType?: string;
  fluctuationRate?: number;
}

export class RevenueRankingResponseDto {
  level: RevenueLevel;
  industryCode?: string;
  items: RevenueRankingItemDto[];
}

export class GetRevenueQueryDto {
  @IsString()
  @IsNotEmpty()
  @IsIn(revenueLevels)
  level: RevenueLevel;

  @IsString()
  @IsNotEmpty()
  code: string;

  @IsString()
  @IsOptional()
  industryCode?: string;

  @IsString()
  @IsOptional()
  industryCodes?: string;

  @IsString()
  @IsOptional()
  quarter?: string;
}

export class GetRevenueRankingQueryDto {
  @IsString()
  @IsNotEmpty()
  @IsIn(revenueLevels)
  level: RevenueLevel;

  @IsString()
  @IsOptional()
  parentGuCode?: string;

  @IsString()
  @IsOptional()
  industryCode?: string;

  @IsString()
  @IsOptional()
  industryCodes?: string;

  @IsString()
  @IsOptional()
  quarter?: string;
}
// Analytics DTOs
export class AnalyticsSectorDto {
  name: string;
  value: number;
  // color can be assigned in frontend
}

export class AnalyticsSaturationDto {
  name: string;
  value: number; // 0-100 score
  status: string; // '위험', '주의', '보통', '여유'
}

export class AnalyticsGrowthDto {
  period: string; // '23.1Q'
  amount: number;
}

export class AnalyticsRadarItemDto {
  subject: string;
  male: number;
  female: number;
  fullMark: number;
}

export class AnalyticsPopulationDto {
  time: string;
  value: number;
}

export class MarketAnalyticsResponseDto {
  sectors: AnalyticsSectorDto[];
  saturation: AnalyticsSaturationDto[];
  growth: AnalyticsGrowthDto[];
  demographics: AnalyticsRadarItemDto[];
  population: AnalyticsPopulationDto[];
}
