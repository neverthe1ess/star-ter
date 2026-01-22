import { Injectable } from '@nestjs/common';

export interface SalesData {
  thsmon_selng_amt: bigint | number | null;
  agrde_10_selng_amt: bigint | number | null;
  agrde_20_selng_amt: bigint | number | null;
  agrde_30_selng_amt: bigint | number | null;
  agrde_40_selng_amt: bigint | number | null;
  agrde_50_selng_amt: bigint | number | null;
  agrde_60_above_selng_amt: bigint | number | null;
}

const AGE_COLUMN_MAP: Record<string, keyof SalesData> = {
  '20s': 'agrde_20_selng_amt',
  '30s': 'agrde_30_selng_amt',
  '40s': 'agrde_40_selng_amt',
  '50s': 'agrde_50_selng_amt',
  '60s': 'agrde_60_above_selng_amt',
};

const AGE_LABEL_MAP: Record<string, string> = {
  '20s': '20대',
  '30s': '30대',
  '40s': '40대',
  '50s': '50대',
  '60s': '60대 이상',
};

/**
 * 연령대별 만점 기준 (상위 10% 매출 비중 기반)
 * 데이터 분석 결과:
 * - 20대: 상위 10% = 23.41%
 * - 30대: 상위 10% = 32.34%
 * - 40대: 상위 10% = 38.03%
 * - 50대: 상위 10% = 36.81%
 * - 60대+: 상위 10% = 53.59%
 * - 10대: 평균 0.4%로 무시 가능, 33% 유지
 */
const AGE_THRESHOLD_MAP: Record<string, number> = {
  '20s': 0.2341, // 상위 10%
  '30s': 0.3234, // 상위 10%
  '40s': 0.3803, // 상위 10%
  '50s': 0.3681, // 상위 10%
  '60s': 0.5359, // 상위 10%
};

@Injectable()
export class AgeScoreCalculator {
  /**
   * 연령대 점수 계산 (0~1)
   *
   * 연령대별 상위 10% 기준 정규화:
   * - 각 연령대마다 다른 threshold 적용
   * - threshold 이상이면 만점 (1.0)
   * - 그 이하는 선형 증가 (ratio / threshold)
   */
  calculate(salesData: SalesData, targetAge: string): number {
    const total = Number(salesData.thsmon_selng_amt || 0);
    if (total === 0) return 0;

    const ageColumn = AGE_COLUMN_MAP[targetAge];
    if (!ageColumn) return 0;

    const ageAmount = Number(salesData[ageColumn] || 0);
    const ratio = ageAmount / total;

    // 연령대별 threshold 적용
    const threshold = AGE_THRESHOLD_MAP[targetAge] || 0.33;
    return Math.min(ratio / threshold, 1);
  }

  /**
   * 점수 + 설명 + 선택 연령대 비중 함께 반환
   */
  calculateWithExplanation(
    salesData: SalesData,
    targetAge: string,
  ): {
    score: number;
    explanation: string;
    breakdown: { selected: number; others: number };
  } {
    const total = Number(salesData.thsmon_selng_amt || 0);
    const ageLabel = AGE_LABEL_MAP[targetAge] || targetAge;

    // 기본값: 선택 연령대 0%, 나머지 100%
    const breakdown = { selected: 0, others: 100 };

    if (total === 0) {
      return {
        score: 0,
        explanation: `매출 데이터가 없습니다`,
        breakdown,
      };
    }

    const ageColumn = AGE_COLUMN_MAP[targetAge];
    if (!ageColumn) {
      return {
        score: 0,
        explanation: `연령대 정보를 확인할 수 없습니다`,
        breakdown,
      };
    }

    const ageAmount = Number(salesData[ageColumn] || 0);
    const selectedRatio = (ageAmount / total) * 100;
    breakdown.selected = selectedRatio;
    breakdown.others = 100 - selectedRatio;

    // 연령대별 threshold 적용
    const threshold = AGE_THRESHOLD_MAP[targetAge] || 0.33;
    const score = Math.min(selectedRatio / 100 / threshold, 1);

    return {
      score,
      explanation: `${ageLabel} 매출 비중 ${selectedRatio.toFixed(1)}%`,
      breakdown,
    };
  }
}
