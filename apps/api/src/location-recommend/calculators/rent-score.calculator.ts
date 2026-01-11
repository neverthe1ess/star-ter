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
   * 임대료 점수 계산 (0.1 ~ 1.0)
   *
   * 정책:
   * - 상권 평균 비용이 사용자 창업 자본금 이내면 1점
   * - 초과하면 (자본금 / 비용) 비율로 감점
   *
   * @param capital 자본금 문자열 ('10M', '30M', ...)
   * @param avgDeposit 평균 보증금 (천원 단위)
   * @param avgRent 평균 월세 (천원 단위)
   */
  calculate(
    capital: string,
    avgDeposit: number | null,
    avgRent: number | null,
    avgPremim: number | null,
  ): number {
    const capitalAmount = CAPITAL_MAP[capital] || 50000000;

    // 평균 보증금, 평균 월세가 없으면 매물이 없는거임 - 0점 부여
    if (avgDeposit === null && avgRent === null) {
      return 0;
    }

    // 천원 → 원 단위 변환
    const deposit = (avgDeposit || 0) * 1000;
    const rent = (avgRent || 0) * 6 * 1000;
    const premium = (avgPremim || 0) * 1000;
    const totalCost = deposit + rent + premium;

    // 데이터 이상 방어
    if (totalCost <= 0) {
      return 0;
    }

    // 예산 이내 → 만점
    if (totalCost <= capitalAmount) {
      return 1.0;
    }

    // 예산 초과 → 비율 감점
    const ratio = capitalAmount / totalCost;

    // 최소 0.1 보장
    return Math.max(0.1, Math.min(1, ratio));
  }
}
