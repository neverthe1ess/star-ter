import { IsIn, IsOptional, IsString } from 'class-validator';

export class PopulationRankingItemDto {
  code: string;
  name: string;
  amount: number; // population count
  count: number; // stores count (optional, might stay 0 if irrelevant)
  changeType?: string; // HH, LL etc. or Status Label
  fluctuationRate?: number;
}

export class PopulationRankingResponseDto {
  items: PopulationRankingItemDto[];
}

export const ageGroups = ['10', '20', '30', '40', '50', '60'] as const;
export type AgeGroup = (typeof ageGroups)[number] | 'total';

export const timeSlots = ['00', '06', '11', '14', '17', '21'] as const;
export type TimeSlot = (typeof timeSlots)[number] | 'total';

export class GetPopulationRankingQueryDto {
  @IsString()
  @IsOptional()
  @IsIn([...ageGroups, 'total'])
  ageGroup?: AgeGroup;

  @IsString()
  @IsOptional()
  @IsIn([...timeSlots, 'total'])
  timeSlot?: TimeSlot;

  @IsString()
  @IsOptional()
  @IsIn(['gu', 'dong', 'commercial'])
  level?: 'gu' | 'dong' | 'commercial';

  @IsString()
  @IsOptional()
  dayOfWeek?: string; // Optional expansion
}
