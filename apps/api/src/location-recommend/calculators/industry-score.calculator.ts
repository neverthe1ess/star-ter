import { Injectable } from '@nestjs/common';

/**
 * 업종 점수 계산기
 *
 * 공식:
 * 1. industryShare = industrySales / totalSales (해당 상권에서 업종 점유율)
 * 2. industryDemand = industrySales / avgIndustrySales (상권 업종 평균 매출 / 서울 전체 상권의 업종 평균 매출)
 * 3. competitionScore = 1 - industryShare (경쟁 낮을수록 높음)
 * 4. demandScore = min(1, industryDemand) (수요 상한 1)
 * 5. industryScore = competitionScore * 0.6 + demandScore * 0.4
 *
 * 결과:
 * - 블루오션 (경쟁↓, 수요↑): 최상
 * - 레드오션 (경쟁↑, 수요↑): 중간
 * - 황무지 (경쟁↓, 수요↓): 중상
 * - 최악 (경쟁↑, 수요↓): 하
 */
@Injectable()
export class IndustryScoreCalculator {
  /**
   * 업종 점수 계산 (0~1)
   *
   * @param totalSales 상권 전체 매출
   * @param industrySales 상권 내 해당 업종 매출
   * @param avgIndustrySales 전체 상권 평균 해당 업종 매출
   */
  calculate(
    totalSales: number,
    industrySales: number,
    avgIndustrySales: number,
  ): number {
    // 데이터 없으면 중립 점수
    if (totalSales === 0 || avgIndustrySales === 0) {
      return 0.5;
    }

    // 해당 상권에 선택한 업종이 없으면 중립 점수 (데이터 미검증)
    if (industrySales === 0) {
      return 0.5;
    }

    // 1. 기본 값 계산
    const industryShare = industrySales / totalSales; // 0 ~ 1
    const industryDemand = industrySales / avgIndustrySales; // 0 ~ n

    // 2. 점수화
    const competitionScore = 1 - industryShare; // 경쟁 낮을수록 높음
    const demandScore = Math.min(1, industryDemand); // 수요 상한 1

    // 3. 최종 업종 점수 (경쟁 60%, 수요 40%)
    const industryScore = competitionScore * 0.6 + demandScore * 0.4;

    return industryScore;
  }
}
