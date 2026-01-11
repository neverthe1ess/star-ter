import {
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { Type } from 'class-transformer';

export const storeLevels = [
  'city',
  'gu',
  'dong',
  'backarea',
  'commercial',
] as const;
export type StoreLevel = (typeof storeLevels)[number];

export class StoreStatsDto {
  industryCode: string;
  industryName: string;
  storeCount: number;
  similarStoreCount: number;
  franchiseStoreCount: number;
  openRate: number;
  openStoreCount: number;
  closeRate: number;
  closeStoreCount: number;
}

export class StoreResponseDto {
  level: StoreLevel;
  code: string;
  quarter: string;
  items: StoreStatsDto[];
}

export class GetStoreQueryDto {
  @IsString()
  @IsNotEmpty()
  @IsIn(storeLevels)
  level: StoreLevel;

  @IsString()
  @IsNotEmpty()
  code: string;

  @IsString()
  @IsOptional()
  industryCode?: string;

  @IsString()
  @IsOptional()
  quarter?: string;
}

/**
 * 업종별 점포 위치 조회 DTO
 * GET /store/locations?industryCode=I21006&minLng=126.9&maxLng=127.1&minLat=37.4&maxLat=37.6
 */
export class GetStoreLocationsQueryDto {
  @IsString()
  @IsOptional()
  industryCode?: string; // DB 업종 코드 (예: I21006 치킨), 없으면 전체 조회

  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  minLng?: number;

  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  maxLng?: number;

  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  minLat?: number;

  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  maxLat?: number;

  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  // @Max(2000)
  limit?: number;

  @IsString()
  @IsOptional()
  areaCode?: string;

  @IsString()
  @IsOptional()
  // @IsIn(storeLevels)
  level?: StoreLevel;
}

export class StoreLocationDto {
  lng: number;
  lat: number;
  name: string;
  address: string;
}

export class StoreLocationsResponseDto {
  industryCode: string;
  count: number;
  stores: StoreLocationDto[];
}

// 폐업률 랭킹 DTOs
export class GetClosureRateRankingQueryDto {
  @IsString()
  @IsOptional()
  @IsIn(['gu', 'dong', 'commercial'])
  level?: 'gu' | 'dong' | 'commercial';

  @IsString()
  @IsOptional()
  industryCode?: string;

  @IsOptional()
  @IsString()
  keyword?: string; // 검색 키워드 추가
}

export class ClosureRateRankingItemDto {
  code: string;
  name: string;
  closureRate: number; // 폐업률 (%)
  closedStoreCount: number; // 폐업 점포 수
  currentStoreCount: number; // 현재 점포 수
  previousStoreCount: number; // 전분기 점포 수
  changeType?: string; // 상권 상태
}

export class ClosureRateRankingResponseDto {
  level: string;
  quarter: string;
  items: ClosureRateRankingItemDto[];
}
