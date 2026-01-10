import { Injectable } from '@nestjs/common';

const CAPITAL_MAP: Record<string, number> = {
  '10M': 10000000,
  '30M': 30000000,
  '50M': 50000000,
  '100M': 100000000,
  '200M': 200000000,
  '200M+': 300000000,
};

@Injectable()
export class RentScoreCalculator {
  /**
   * 임대료 점수 계산 (0~1)
   *
   * 새 로직:
   * - 자본금과 임대비용이 가까울수록 높은 점수
   * - ratio = min(capital, cost) / max(capital, cost)
   * - 완전히 일치하면 1점, 차이가 클수록 0에 가까워짐
   *
   * @param capital 자본금 문자열 ('10M', '30M', ...)
   * @param avgDeposit 평균 보증금 (원)
   * @param avgRent 평균 월세 (원)
   */
  calculate(
    capital: string,
    avgDeposit: number | null,
    avgRent: number | null,
  ): number {
    const capitalAmount = CAPITAL_MAP[capital] || 50000000;

    // 임대료 정보가 없으면 0.5점 (중립)
    if (avgDeposit === null && avgRent === null) {
      return 0.5;
    }

    // 총 비용 계산: 보증금 + 월세
    // DB 값은 천원 단위이므로 * 1000 해서 원 단위로 변환
    const deposit = (avgDeposit || 0) * 1000;
    const rent = (avgRent || 0) * 1000;
    const totalCost = deposit + rent;

    if (totalCost <= 0) return 0.5; // 데이터 이상

    // 가까울수록 높은 점수 (0~1)
    // ratio = min / max → 일치하면 1, 차이 클수록 0에 가까움
    const minVal = Math.min(capitalAmount, totalCost);
    const maxVal = Math.max(capitalAmount, totalCost);
    const score = minVal / maxVal;

    // 0.1 ~ 1.0 범위로 조정
    return Math.max(0.1, Math.min(1, score));
  }
}
