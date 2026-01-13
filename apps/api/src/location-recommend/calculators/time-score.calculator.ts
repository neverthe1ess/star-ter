import { Injectable } from '@nestjs/common';

// 시간대별 매출 데이터 인터페이스 (로컬)
export interface TimeSalesData {
  thsmon_selng_amt: bigint | number | null;
  tmzon_00_06_selng_amt: bigint | number | null;
  tmzon_06_11_selng_amt: bigint | number | null;
  tmzon_11_14_selng_amt: bigint | number | null;
  tmzon_14_17_selng_amt: bigint | number | null;
  tmzon_17_21_selng_amt: bigint | number | null;
  tmzon_21_24_selng_amt: bigint | number | null;
}

type TimeColumn = keyof TimeSalesData;

const TIME_COLUMN_MAP: Record<string, TimeColumn[]> = {
  morning: ['tmzon_06_11_selng_amt'],
  afternoon: ['tmzon_11_14_selng_amt', 'tmzon_14_17_selng_amt'],
  evening: ['tmzon_17_21_selng_amt', 'tmzon_21_24_selng_amt'],
  night: ['tmzon_00_06_selng_amt'],
  allday: [], // 전체 시간대 → ratio = 1
};

@Injectable()
export class TimeScoreCalculator {
  /**
   * 시간대 점수 계산 (0~1)
   *
   * 캡핑 기반 정규화:
   * - 30% 이상의 시간대 매출 비율 = 만점 (1.0)
   * - 그 이하는 선형 증가 (ratio / 0.30)
   *
   * 이유: 대부분의 시간대에서 30%면 충분히 집중된 상권을 의미.
   */
  private readonly MAX_RATIO = 0.3;

  calculate(salesData: TimeSalesData, targetTime: string): number {
    if (targetTime === 'allday') return 1; // 전체 시간대는 항상 1점

    const total = Number(salesData.thsmon_selng_amt || 0);
    if (total === 0) return 0;

    const timeColumns = TIME_COLUMN_MAP[targetTime] || [];
    const timeAmount = timeColumns.reduce((sum, col) => {
      return sum + Number(salesData[col] || 0);
    }, 0);

    const ratio = timeAmount / total;

    // 캡핑 기반 정규화: 30% 이상이면 만점
    return Math.min(ratio / this.MAX_RATIO, 1);
  }
}
