import { IsNumber, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class GetRealEstateQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  minx?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  miny?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  maxx?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  maxy?: number;

  // 자본금/필터 관련 파라미터
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  maxDeposit?: number; // 최대 보증금 (만원)

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  maxMonthlyRent?: number; // 최대 월세 (만원)

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  minSize?: number; // 최소 면적 (평)

  @IsOptional()
  @IsString()
  keywords?: string; // 검색 키워드
}
