import { Injectable } from '@nestjs/common';
import { RecommendRequestDto } from './dto/recommend-request.dto';
import {
  RecommendResponseDto,
  ScoredLocation,
} from './dto/recommend-response.dto';
import { PrismaService } from '../prisma/prisma.service';
import { AgeScoreCalculator } from './calculators/age-score.calculator';
import { TimeScoreCalculator } from './calculators/time-score.calculator';
import { RentScoreCalculator } from './calculators/rent-score.calculator';
import { RegionScoreCalculator } from './calculators/region-score.calculator';
import {
  RentRepository,
  CommercialRentData,
} from './repositories/rent.repository';
import { PopulationRepository } from './repositories/region.repository';
import { WEIGHTS } from './constants/weights';

@Injectable()
export class LocationRecommendService {
  private ageCalculator = new AgeScoreCalculator();
  private timeCalculator = new TimeScoreCalculator();
  private rentCalculator = new RentScoreCalculator();
  private regionCalculator = new RegionScoreCalculator();

  constructor(
    private readonly prisma: PrismaService,
    private readonly rentRepository: RentRepository,
    private readonly populationRepository: PopulationRepository,
  ) {}

  async getRecommendations(
    dto: RecommendRequestDto,
  ): Promise<RecommendResponseDto> {
    console.log('[LocationRecommend] Request:', dto);

    // 1. 상권별 매출 데이터 가져오기 (상위 50개)
    const salesData = await this.prisma.salesCommercial.findMany({
      orderBy: { thsmon_selng_amt: 'desc' },
      take: 50,
      distinct: ['trdar_cd'],
    });

    console.log(
      `[LocationRecommend] Found ${salesData.length} commercial areas`,
    );

    // 상권 코드 목록
    const commercialCodes = salesData.map((s) => s.trdar_cd);

    // 2. 상권별 임대료 데이터 가져오기 (PostGIS 공간 조인)
    const rentDataList = await this.rentRepository.getAllCommercialRents();
    const rentDataMap = new Map<string, CommercialRentData>();
    rentDataList.forEach((rent) => {
      rentDataMap.set(rent.trdar_cd, rent);
    });

    console.log(
      `[LocationRecommend] Found ${rentDataList.length} commercial areas with rent data`,
    );

    // 디버그: 임대료 데이터 샘플 출력
    if (rentDataList.length > 0) {
      console.log(
        '[LocationRecommend] Rent data sample:',
        rentDataList.slice(0, 3),
      );
      const matchCount = commercialCodes.filter((code) =>
        rentDataMap.has(code),
      ).length;
      console.log(
        `[LocationRecommend] Matched ${matchCount}/${commercialCodes.length} commercial codes with rent data`,
      );
    }

    // 3. 상권별 인구/시설 데이터 가져오기 (지역 테마 점수용)
    const regionDataMap =
      await this.populationRepository.getRegionDataForCommercials(
        commercialCodes,
      );
    console.log(
      `[LocationRecommend] Found ${regionDataMap.size} commercial areas with region data`,
    );

    // 최대 유동인구 계산 (정규화용)
    let maxFootTraffic = 1;
    regionDataMap.forEach((data) => {
      if (data.tot_flpop_co > maxFootTraffic) {
        maxFootTraffic = data.tot_flpop_co;
      }
    });

    // 4. 각 상권에 대해 점수 계산
    const scoredLocations: ScoredLocation[] = salesData.map((sales) => {
      // Age Score
      const ageScore = this.ageCalculator.calculate(
        {
          thsmon_selng_amt: sales.thsmon_selng_amt,
          agrde_10_selng_amt: sales.agrde_10_selng_amt,
          agrde_20_selng_amt: sales.agrde_20_selng_amt,
          agrde_30_selng_amt: sales.agrde_30_selng_amt,
          agrde_40_selng_amt: sales.agrde_40_selng_amt,
          agrde_50_selng_amt: sales.agrde_50_selng_amt,
          agrde_60_above_selng_amt: sales.agrde_60_above_selng_amt,
        },
        dto.age,
      );

      // Time Score
      const timeScore = this.timeCalculator.calculate(
        {
          thsmon_selng_amt: sales.thsmon_selng_amt,
          tmzon_00_06_selng_amt: sales.tmzon_00_06_selng_amt,
          tmzon_06_11_selng_amt: sales.tmzon_06_11_selng_amt,
          tmzon_11_14_selng_amt: sales.tmzon_11_14_selng_amt,
          tmzon_14_17_selng_amt: sales.tmzon_14_17_selng_amt,
          tmzon_17_21_selng_amt: sales.tmzon_17_21_selng_amt,
          tmzon_21_24_selng_amt: sales.tmzon_21_24_selng_amt,
        },
        dto.operatingTime,
      );

      // Region Score (실제 인구/시설 데이터 사용)
      const regionData = regionDataMap.get(sales.trdar_cd);
      const regionScore = this.regionCalculator.calculate(
        dto.region,
        regionData,
        maxFootTraffic,
      );

      // Rent Score (실제 임대료 데이터 사용)
      const rentData = rentDataMap.get(sales.trdar_cd);
      const rentScore = this.rentCalculator.calculate(
        dto.capital,
        rentData?.avg_deposit ?? null,
        rentData?.avg_rent ?? null,
        // rentData?.avg_premium ?? null,
      );

      // Total Score (가중 합산 - 4개 요소)
      const totalScore =
        ageScore * WEIGHTS.age +
        regionScore * WEIGHTS.region +
        timeScore * WEIGHTS.time +
        rentScore * WEIGHTS.rent;

      return {
        id: sales.trdar_cd,
        name: sales.trdar_cd_nm || sales.trdar_cd,
        totalScore: Math.round(totalScore * 10) / 10, // 소수점 1자리
        scores: {
          age: Math.round(ageScore * 100) / 100,
          region: Math.round(regionScore * 100) / 100,
          time: Math.round(timeScore * 100) / 100,
          rent: Math.round(rentScore * 100) / 100,
        },
      };
    });

    // 5. 총점 기준 정렬
    scoredLocations.sort((a, b) => b.totalScore - a.totalScore);

    // 6. 정규화: Top 1 = 100점 기준으로 스케일 변환
    const maxScore = scoredLocations[0]?.totalScore || 1;
    scoredLocations.forEach((loc) => {
      loc.totalScore = Math.round((loc.totalScore / maxScore) * 100 * 10) / 10;
    });

    console.log(`[LocationRecommend] Top 3:`, scoredLocations.slice(0, 3));

    return {
      locations: scoredLocations.slice(0, 20), // 상위 20개 반환
    };
  }
}
