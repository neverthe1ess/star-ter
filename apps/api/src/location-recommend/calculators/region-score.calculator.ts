import { Injectable } from '@nestjs/common';
import { RegionData } from '../repositories/region.repository';

/**
 * 지역 테마 점수 계산
 *
 * 테마별 점수 기준:
 * - office: 직장인구 비율 (tot_wrc_popltn_co / totalPop)
 * - residential: 주거인구 + 아파트 세대수 ((tot_repop_co + apt_hshld_co * 2) / totalPop)
 * - commercial: 유동인구 기반 (tot_flpop_co 정규화)
 * - university: 대학 존재 + 20대 비율 (univ_co > 0 ? 1 : 0.5 + 20대비율)
 * - station: 지하철역 존재 여부 (subway_statn_co > 0 ? 1 : 0)
 * - tourist: 관광시설 + 숙박시설 ((viatr_fclty_co + stayng_fclty_co) / 10, max 1)
 */

@Injectable()
export class RegionScoreCalculator {
  /**
   * 지역 테마 점수 계산 (0~1)
   * @param theme 사용자가 선택한 테마
   * @param data 해당 상권의 인구/시설 데이터
   * @param maxPopulation 정규화를 위한 최대 인구 (optional)
   */
  calculate(
    theme: string,
    data: RegionData | undefined,
    maxPopulation: number,
  ): number {
    if (!data) return 0.5; // 데이터 없으면 중립 점수

    // 상권의 전체 직장인구 수 + 전체 거주자 수 + 유동인구 수
    const totalPop =
      data.tot_wrc_popltn_co + data.tot_repop_co + data.tot_flpop_co;

    switch (theme) {
      case 'office': {
        // 직장인구 비율
        if (totalPop === 0) return 0.5;
        const ratio = data.tot_wrc_popltn_co / totalPop;
        return Math.min(1, ratio * 3); // 33% 이상이면 1점
      }

      case 'residential': {
        // 주거인구 + 아파트 세대수 가중치
        if (totalPop === 0) return 0.5;
        const residentialScore =
          (data.tot_repop_co + data.apt_hshld_co * 2) / totalPop;
        return Math.min(1, residentialScore * 2);
      }

      case 'commercial': {
        // 유동인구 정규화
        const normalizedFootTraffic = data.tot_flpop_co / maxPopulation;
        return Math.min(1, normalizedFootTraffic);
      }

      case 'university': {
        // 대학 존재 + 20대 비율
        const hasUniv = data.univ_co > 0 ? 0.5 : 0;
        const twentiesRatio =
          data.tot_flpop_co > 0
            ? data.agrde_20_flpop_co / data.tot_flpop_co
            : 0;
        return Math.min(1, hasUniv + twentiesRatio);
      }

      case 'station': {
        // 지하철역 존재 여부
        return data.subway_statn_co > 0 ? 1 : 0;
      }

      case 'tourist': {
        // 관광시설 + 숙박시설
        const touristScore = (data.viatr_fclty_co + data.stayng_fclty_co) / 10;
        return Math.min(1, touristScore);
      }

      default:
        return 0.5;
    }
  }
}
