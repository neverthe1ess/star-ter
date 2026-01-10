import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

export interface RegionData {
  trdar_cd: string;
  // Working population
  tot_wrc_popltn_co: number;
  // Resident population
  tot_repop_co: number;
  apt_hshld_co: number;
  // Foot traffic
  tot_flpop_co: number;
  agrde_20_flpop_co: number;
  // Facility
  univ_co: number;
  subway_statn_co: number;
  viatr_fclty_co: number;
  stayng_fclty_co: number;
}

@Injectable()
export class PopulationRepository {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * 상권별 인구/시설 데이터 조회 (지역 테마 점수 계산용)
   */
  async getRegionDataForCommercials(
    commercialCodes: string[],
  ): Promise<Map<string, RegionData>> {
    const resultMap = new Map<string, RegionData>();

    // 병렬로 데이터 조회
    const [working, resident, footTraffic, facility] = await Promise.all([
      this.prisma.workingPopulationCommercial.findMany({
        where: { trdar_cd: { in: commercialCodes } },
        distinct: ['trdar_cd'],
        orderBy: { stdr_yyqu_cd: 'desc' },
      }),
      this.prisma.residentPopulationCommercial.findMany({
        where: { trdar_cd: { in: commercialCodes } },
        distinct: ['trdar_cd'],
        orderBy: { stdr_yyqu_cd: 'desc' },
      }),
      this.prisma.footTrafficCommercial.findMany({
        where: { trdar_cd: { in: commercialCodes } },
        distinct: ['trdar_cd'],
        orderBy: { stdr_yyqu_cd: 'desc' },
      }),
      this.prisma.facilityCommercial.findMany({
        where: { trdar_cd: { in: commercialCodes } },
        distinct: ['trdar_cd'],
        orderBy: { stdr_yyqu_cd: 'desc' },
      }),
    ]);

    // Map으로 변환
    const workingMap = new Map(working.map((w) => [w.trdar_cd, w]));
    const residentMap = new Map(resident.map((r) => [r.trdar_cd, r]));
    const footTrafficMap = new Map(footTraffic.map((f) => [f.trdar_cd, f]));
    const facilityMap = new Map(facility.map((f) => [f.trdar_cd, f]));

    // 합쳐서 RegionData 생성
    for (const code of commercialCodes) {
      const w = workingMap.get(code);
      const r = residentMap.get(code);
      const f = footTrafficMap.get(code);
      const fac = facilityMap.get(code);

      resultMap.set(code, {
        trdar_cd: code,
        tot_wrc_popltn_co: w?.tot_wrc_popltn_co ?? 0,
        tot_repop_co: r?.tot_repop_co ?? 0,
        apt_hshld_co: r?.apt_hshld_co ?? 0,
        tot_flpop_co: Number(f?.tot_flpop_co ?? 0),
        agrde_20_flpop_co: Number(f?.agrde_20_flpop_co ?? 0),
        univ_co: fac?.univ_co ?? 0,
        subway_statn_co: fac?.subway_statn_co ?? 0,
        viatr_fclty_co: fac?.viatr_fclty_co ?? 0,
        stayng_fclty_co: fac?.stayng_fclty_co ?? 0,
      });
    }

    return resultMap;
  }
}
