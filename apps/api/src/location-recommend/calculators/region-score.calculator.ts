import { Injectable } from '@nestjs/common';
import { RegionData } from '../repositories/region.repository';

/**
 * 지역 테마 점수 계산
 *
 * 통일된 설계 원칙:
 * - 모든 테마는 "면적당 인구 밀도" 기준으로 점수 계산
 * - 상위 10% 상권 기준으로 만점 (threshold 방식)
 * - 점수 = min(density / threshold, 1)
 *
 * 테마별 만점 기준 (실제 데이터 상위 10% 기반):
 * - office: 면적당 직장인 0.05명 이상 (밀도 기준)
 * - residential: 면적당 거주자 0.04명 이상 (밀도 기준)
 * - commercial: 면적당 유동인구 16명 이상 (밀도 기준)
 * - university: 20대 비중 30% 이상 + 대학 보너스
 * - station: 지하철역 존재 여부 (binary)
 * - tourist: 집객시설 수 40개 이상
 */

const THEME_LABEL_MAP: Record<string, string> = {
  office: '오피스 밀집',
  residential: '주거 밀집',
  commercial: '상업 지역',
  university: '대학가',
  station: '역세권',
  tourist: '관광지',
};

@Injectable()
export class RegionScoreCalculator {
  // 테마별 만점 기준 (면적당 인구 밀도, 상위 10% 기준)
  private readonly THRESHOLDS = {
    OFFICE_DENSITY: 0.05, // 면적당 직장인 0.05명 이상이면 만점
    RESIDENTIAL_DENSITY: 0.04, // 면적당 거주자 0.04명 이상이면 만점
    COMMERCIAL_DENSITY: 16, // 면적당 유동인구 16명 이상이면 만점
    UNIVERSITY: 0.3, // 20대 30% 이상이면 만점
    TOURIST_FACILITIES: 70, // 집객시설 70개 이상이면 만점
  };

  // 가중치 (필수/지배 조건)
  // university: 20대 비중으로 기본 점수 계산, 대학이 없으면 강한 패널티 적용 (최대 40%)
  private readonly WEIGHTS = {
    UNIVERSITY_WITH_UNIV: 1, // 대학 존재시 100%
    UNIVERSITY_WITHOUT_UNIV: 0.4, // 대학 미존재시 40% (패널티)
  };

  /**
   * 지역 테마 점수 계산 (0~1)
   * @param theme 사용자가 선택한 테마
   * @param data 해당 상권의 인구/시설 데이터
   * @param _maxPopulation 사용하지 않음 (하위 호환성 유지)
   */
  calculate(
    theme: string,
    data: RegionData | undefined,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _maxPopulation?: number, // 하위 호환성 유지 (내부적으로 미사용)
  ): number {
    if (!data) return 0.5; // 데이터 없으면 중립 점수

    const area = data.relm_ar || 1; // 면적 (0 방지)

    switch (theme) {
      case 'office': {
        // 면적당 직장인 밀도: 0.05명/㎡ 이상이면 만점
        const density = data.tot_wrc_popltn_co / area;
        return Math.min(density / this.THRESHOLDS.OFFICE_DENSITY, 1);
      }

      case 'residential': {
        // 면적당 거주자 밀도: 0.04명/㎡ 이상이면 만점
        const density = data.tot_repop_co / area;
        return Math.min(density / this.THRESHOLDS.RESIDENTIAL_DENSITY, 1);
      }

      case 'commercial': {
        // 면적당 유동인구 밀도: 16명/㎡ 이상이면 만점
        const density = data.tot_flpop_co / area;
        return Math.min(density / this.THRESHOLDS.COMMERCIAL_DENSITY, 1);
      }

      case 'university': {
        // 20대 비중으로 기본 점수 계산
        // 대학이 없으면 점수에 패널티 적용 (최대 40%)
        const twentiesRatio =
          data.tot_flpop_co > 0
            ? data.agrde_20_flpop_co / data.tot_flpop_co
            : 0;

        const baseScore = Math.min(
          twentiesRatio / this.THRESHOLDS.UNIVERSITY,
          1,
        );

        const univWeight =
          data.univ_co > 0
            ? this.WEIGHTS.UNIVERSITY_WITH_UNIV
            : this.WEIGHTS.UNIVERSITY_WITHOUT_UNIV;

        return baseScore * univWeight;
      }

      case 'station': {
        // 지하철역 존재 여부 (binary)
        return data.subway_statn_co > 0 ? 1 : 0;
      }

      case 'tourist': {
        // 집객시설 수: 70개 이상이면 만점
        const facilityCount = data.viatr_fclty_co;
        return Math.min(facilityCount / this.THRESHOLDS.TOURIST_FACILITIES, 1);
      }

      default:
        return 0.5;
    }
  }

  /**
   * 점수 + 설명 + 상권 세부 정보 함께 반환
   */
  calculateWithExplanation(
    theme: string,
    data: RegionData | undefined,
  ): {
    score: number;
    explanation: string;
    details: {
      theme: string;
      themeLabel: string;
      mainAgeGroup: string;
      mainAgeRatio: number;
      nearbyUniversities: number;
      nearbySubways: number;
      footTraffic: number;
    };
  } {
    const themeLabel = THEME_LABEL_MAP[theme] || theme;

    // 기본 details
    const details = {
      theme,
      themeLabel,
      mainAgeGroup: '-',
      mainAgeRatio: 0,
      nearbyUniversities: 0,
      nearbySubways: 0,
      footTraffic: 0,
    };

    if (!data) {
      return {
        score: 0.5,
        explanation: `상권 데이터가 없습니다`,
        details,
      };
    }

    // 상세 정보 채우기
    details.nearbyUniversities = data.univ_co;
    details.nearbySubways = data.subway_statn_co;
    details.footTraffic = data.tot_flpop_co;

    // 주요 연령층 계산 (가장 비중이 높은 연령대 찾기)
    if (data.tot_flpop_co > 0) {
      const ageGroups = [
        { name: '10대', value: data.agrde_10_flpop_co },
        { name: '20대', value: data.agrde_20_flpop_co },
        { name: '30대', value: data.agrde_30_flpop_co },
        { name: '40대', value: data.agrde_40_flpop_co },
        { name: '50대', value: data.agrde_50_flpop_co },
        { name: '60대+', value: data.agrde_60_above_flpop_co },
      ];
      const maxGroup = ageGroups.reduce((max, group) =>
        group.value > max.value ? group : max,
      );
      details.mainAgeGroup = maxGroup.name;
      details.mainAgeRatio = (maxGroup.value / data.tot_flpop_co) * 100;
    }

    const area = data.relm_ar || 1; // 면적 (0 방지)

    switch (theme) {
      case 'office': {
        const density = data.tot_wrc_popltn_co / area;
        const score = Math.min(density / this.THRESHOLDS.OFFICE_DENSITY, 1);
        return {
          score,
          explanation: `면적당 직장인 ${density.toFixed(4)}명/㎡`,
          details,
        };
      }

      case 'residential': {
        const density = data.tot_repop_co / area;
        const score = Math.min(
          density / this.THRESHOLDS.RESIDENTIAL_DENSITY,
          1,
        );
        return {
          score,
          explanation: `면적당 거주자 ${density.toFixed(4)}명/㎡`,
          details,
        };
      }

      case 'commercial': {
        const density = data.tot_flpop_co / area;
        const score = Math.min(density / this.THRESHOLDS.COMMERCIAL_DENSITY, 1);
        return {
          score,
          explanation: `면적당 유동인구 ${density.toFixed(2)}명/㎡`,
          details,
        };
      }

      case 'university': {
        const twentiesRatio =
          data.tot_flpop_co > 0
            ? data.agrde_20_flpop_co / data.tot_flpop_co
            : 0;
        const baseScore = Math.min(
          twentiesRatio / this.THRESHOLDS.UNIVERSITY,
          1,
        );
        const univWeight =
          data.univ_co > 0
            ? this.WEIGHTS.UNIVERSITY_WITH_UNIV
            : this.WEIGHTS.UNIVERSITY_WITHOUT_UNIV;
        const score = baseScore * univWeight;
        const univInfo =
          data.univ_co > 0 ? `, 대학 ${data.univ_co}개` : ' (인근 대학 없음)';
        return {
          score,
          explanation: `20대 비중 ${(twentiesRatio * 100).toFixed(1)}%${univInfo}`,
          details,
        };
      }

      case 'station': {
        const score = data.subway_statn_co > 0 ? 1 : 0;
        return {
          score,
          explanation:
            data.subway_statn_co > 0
              ? `지하철역 ${data.subway_statn_co}개`
              : '인근 지하철역 없음',
          details,
        };
      }

      case 'tourist': {
        const facilityCount = data.viatr_fclty_co;
        const score = Math.min(
          facilityCount / this.THRESHOLDS.TOURIST_FACILITIES,
          1,
        );
        return {
          score,
          explanation: `집객시설 ${facilityCount}개`,
          details,
        };
      }

      default:
        return {
          score: 0.5,
          explanation: `${themeLabel} 테마`,
          details,
        };
    }
  }
}
