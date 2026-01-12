import { Injectable } from '@nestjs/common';

export interface SalesData {
  thsmon_selng_amt: bigint | null;
  agrde_10_selng_amt: bigint | null;
  agrde_20_selng_amt: bigint | null;
  agrde_30_selng_amt: bigint | null;
  agrde_40_selng_amt: bigint | null;
  agrde_50_selng_amt: bigint | null;
  agrde_60_above_selng_amt: bigint | null;
}

const AGE_COLUMN_MAP: Record<string, keyof SalesData> = {
  '10s': 'agrde_10_selng_amt',
  '20s': 'agrde_20_selng_amt',
  '30s': 'agrde_30_selng_amt',
  '40s': 'agrde_40_selng_amt',
  '50s': 'agrde_50_selng_amt',
  '60s': 'agrde_60_above_selng_amt',
};

@Injectable()
export class AgeScoreCalculator {
  /**
   * 연령대 점수 계산 (0~1)
   * 해당 연령대 매출 비율이 높을수록 점수가 높음
   */
  calculate(salesData: SalesData, targetAge: string): number {
    const total = Number(salesData.thsmon_selng_amt || 0);
    if (total === 0) return 0;

    const ageColumn = AGE_COLUMN_MAP[targetAge];
    if (!ageColumn) return 0;

    const ageAmount = Number(salesData[ageColumn] || 0);
    return ageAmount / total;
  }
}
