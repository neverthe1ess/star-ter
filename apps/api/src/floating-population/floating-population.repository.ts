/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */

import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  TimeSegmentedPopulationFeature,
  TimeSlotPopulation,
  GeoJsonGeometry,
  HourlyPopulationFeature,
  HourlyPopulation,
} from './dto/floating-population-response.dto';
import {
  GetPopulationRankingQueryDto,
  PopulationRankingItemDto,
} from './dto/population-ranking.dto';
import {
  RawQueryResult,
  MZRankingRow,
  GenderRankingRow,
  RawHourlyQueryResult,
} from './dto/repository.types';

// 전역 상수 정의
const AGE_GROUPS = [
  '00',
  '10',
  '15',
  '20',
  '25',
  '30',
  '35',
  '40',
  '45',
  '50',
  '55',
  '60',
  '65',
  '70',
] as const;
const GENDERS = ['m', 'f'] as const;
const GRANULAR_FIELDS = GENDERS.flatMap((g) =>
  AGE_GROUPS.map((a) => `${g}${a}`),
);

@Injectable()
export class FloatingPopulationRepository {
  private readonly logger = new Logger(FloatingPopulationRepository.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * [Revolutionary Refactor]
   * 1. LEFT JOIN: seoul_250_grid를 기준으로 population을 붙여서 데이터가 없는 격자까지 "비교" 가능하게 조회합니다.
   * 2. Payload Optimization: 필드명을 단축(ts, ap, sp)하여 네트워크 전송량을 최소화했습니다.
   * 3. Logic: DB에서는 순수 데이터만 가져오고, 복합 합계(male_total 등)는 서버(TS)에서 계산합니다.
   */
  async findTimeSegmentedLayer(
    minLat: number,
    minLng: number,
    maxLat: number,
    maxLng: number,
  ): Promise<TimeSegmentedPopulationFeature[]> {
    // 28개 기초 필드 SUM 구문 생성
    const granularSums = GRANULAR_FIELDS.map(
      (f) => `SUM(p."${f}") as ${f}`,
    ).join(', ');

    const query = `
      WITH viewport_grids AS (
        SELECT cell_id, geom 
        FROM "seoul_250_grid"
        WHERE ST_Intersects(geom, ST_MakeEnvelope(${minLng}, ${minLat}, ${maxLng}, ${maxLat}, 4326))
      ),
      population_stats AS (
        SELECT 
          p."cell_id" as cid,
          CASE 
            WHEN CAST(p."tt" AS INTEGER) BETWEEN 0 AND 7 THEN '0-8'
            WHEN CAST(p."tt" AS INTEGER) BETWEEN 8 AND 15 THEN '8-16'
            ELSE '16-24'
          END as ts,
          AVG(p."spop") as ap,
          SUM(p."spop") as sp,
          ${granularSums}
        FROM "seoul_250_population" p
        WHERE p."cell_id" IN (SELECT cell_id FROM viewport_grids)
        GROUP BY p."cell_id", ts
      )
      SELECT 
        g.cell_id as id, 
        ST_AsGeoJSON(g.geom) as geom, 
        json_agg(
          json_build_object(
            'ts', s.ts,
            'ap', s.ap,
            'sp', s.sp,
            ${GRANULAR_FIELDS.map((f) => `'${f}', s.${f}`).join(',\n')}
          ) ORDER BY s.ts
        ) FILTER (WHERE s.ts IS NOT NULL) as slots
      FROM viewport_grids g
      LEFT JOIN population_stats s ON g.cell_id = s.cid
      GROUP BY g.cell_id, g.geom;
    `;

    try {
      const rawResults =
        await this.prisma.$queryRawUnsafe<RawQueryResult[]>(query);

      return rawResults.map((row) => ({
        cell_id: row.id,
        geometry: JSON.parse(row.geom) as GeoJsonGeometry,
        time_slots: (row.slots || []).map((t) => {
          const slot = {
            time_slot: t.ts,
            avg_population: Number(t.ap) || 0,
            sum_population: Number(t.sp) || 0,
          } as TimeSlotPopulation;

          // 1. 기초 데이터 복사 및 성별 합계 계산
          let maleTotal = 0;
          let femaleTotal = 0;
          GRANULAR_FIELDS.forEach((f) => {
            const val = Number(t[f]) || 0;
            (slot as unknown as Record<string, number>)[f] = val;
            if (f.startsWith('m')) {
              maleTotal += val;
            } else {
              femaleTotal += val;
            }
          });

          slot.male_total = maleTotal;
          slot.female_total = femaleTotal;

          // 2. 연령대 합계 계산 (TS 이관으로 DB 부하 감소)
          const getSum = (...fields: (keyof TimeSlotPopulation)[]): number =>
            fields.reduce((sum, f) => sum + (Number(slot[f]) || 0), 0);

          slot.age_10s_total = getSum('m10', 'm15', 'f10', 'f15');
          slot.age_20s_total = getSum('m20', 'm25', 'f20', 'f25');
          slot.age_30s_total = getSum('m30', 'm35', 'f30', 'f35');
          slot.age_40s_total = getSum('m40', 'm45', 'f40', 'f45');
          slot.age_50s_total = getSum('m50', 'm55', 'f50', 'f55');
          slot.age_60s_plus_total = getSum(
            'm60',
            'm65',
            'm70',
            'f60',
            'f65',
            'f70',
          );
          return slot;
        }),
      }));
    } catch (error) {
      this.logger.error(
        'Database query failed in findTimeSegmentedLayer',
        error,
      );
      throw error;
    }
  }

  /**
   * [1시간 단위 히트맵용 조회]
   * tt 필드(0~23)를 그룹화하지 않고 시간별로 조회합니다.
   * 24개 시간대 데이터를 반환하여 1시간 단위 히트맵 구현을 지원합니다.
   */
  async findHourlyLayer(
    minLat: number,
    minLng: number,
    maxLat: number,
    maxLng: number,
  ): Promise<HourlyPopulationFeature[]> {
    // 28개 기초 필드 SUM 구문 생성
    const granularSums = GRANULAR_FIELDS.map(
      (f) => `SUM(p."${f}") as ${f}`,
    ).join(', ');

    const query = `
      WITH viewport_grids AS (
        SELECT cell_id, geom 
        FROM "seoul_250_grid"
        WHERE ST_Intersects(geom, ST_MakeEnvelope(${minLng}, ${minLat}, ${maxLng}, ${maxLat}, 4326))
      ),
      hourly_stats AS (
        SELECT 
          p."cell_id" as cid,
          CAST(p."tt" AS INTEGER) as hour,
          AVG(p."spop") as ap,
          SUM(p."spop") as sp,
          ${granularSums}
        FROM "seoul_250_population" p
        WHERE p."cell_id" IN (SELECT cell_id FROM viewport_grids)
        GROUP BY p."cell_id", CAST(p."tt" AS INTEGER)
      )
      SELECT 
        g.cell_id as id, 
        ST_AsGeoJSON(g.geom) as geom, 
        json_agg(
          json_build_object(
            'hour', s.hour,
            'ap', s.ap,
            'sp', s.sp,
            ${GRANULAR_FIELDS.map((f) => `'${f}', s.${f}`).join(',\n')}
          ) ORDER BY s.hour
        ) FILTER (WHERE s.hour IS NOT NULL) as hours
      FROM viewport_grids g
      LEFT JOIN hourly_stats s ON g.cell_id = s.cid
      GROUP BY g.cell_id, g.geom;
    `;

    try {
      const rawResults =
        await this.prisma.$queryRawUnsafe<RawHourlyQueryResult[]>(query);

      return rawResults.map((row) => ({
        cell_id: row.id,
        geometry: JSON.parse(row.geom) as GeoJsonGeometry,
        hourly_data: (row.hours || []).map((h) => {
          // 성별 합계 계산
          let maleTotal = 0;
          let femaleTotal = 0;
          GRANULAR_FIELDS.forEach((f) => {
            const val = Number(h[f]) || 0;
            if (f.startsWith('m')) {
              maleTotal += val;
            } else {
              femaleTotal += val;
            }
          });

          // 연령대 합계 계산 헬퍼
          const getSum = (...fields: string[]): number =>
            fields.reduce((sum, f) => sum + (Number(h[f]) || 0), 0);

          return {
            hour: Number(h.hour),
            avg_population: Number(h.ap) || 0,
            sum_population: Number(h.sp) || 0,
            male_total: maleTotal,
            female_total: femaleTotal,
            age_10s_total: getSum('m10', 'm15', 'f10', 'f15'),
            age_20s_total: getSum('m20', 'm25', 'f20', 'f25'),
            age_30s_total: getSum('m30', 'm35', 'f30', 'f35'),
            age_40s_total: getSum('m40', 'm45', 'f40', 'f45'),
            age_50s_total: getSum('m50', 'm55', 'f50', 'f55'),
            age_60s_plus_total: getSum(
              'm60',
              'm65',
              'm70',
              'f60',
              'f65',
              'f70',
            ),
          } as HourlyPopulation;
        }),
      }));
    } catch (error) {
      this.logger.error('Database query failed in findHourlyLayer', error);
      throw error;
    }
  }

  async findRanking(
    query: GetPopulationRankingQueryDto,
  ): Promise<PopulationRankingItemDto[]> {
    // 1. Level Config
    const level = query.level || 'commercial';
    const configMap = {
      gu: {
        model: 'footTrafficGu',
        changeModel: 'commercialChangeGu',
        table: 'foot_traffic_gu',
        codeField: 'signgu_cd',
        nameField: 'signgu_cd_nm',
      },
      dong: {
        model: 'footTrafficDong',
        changeModel: 'commercialChangeDong',
        table: 'foot_traffic_dong',
        codeField: 'adstrd_cd',
        nameField: 'adstrd_cd_nm',
      },
      commercial: {
        model: 'footTrafficCommercial',
        changeModel: 'commercialChangeCommercial',
        table: 'foot_traffic_commercial',
        codeField: 'trdar_cd',
        nameField: 'trdar_cd_nm',
      },
    };
    const cfg = configMap[level];

    // 2. Get Quarters
    // Use the dynamic model to find the latest quarter
    const latest = await (this.prisma as any)[cfg.model].findFirst({
      orderBy: { stdr_yyqu_cd: 'desc' },
      select: { stdr_yyqu_cd: true },
    });
    const currentQ = latest?.stdr_yyqu_cd || '20233';
    const prevQ = this.getPreviousQuarter(currentQ);

    let items: {
      code: string;
      name: string;
      amount: number;
      currentMetricVal?: number;
    }[] = [];
    let metricField = 'tot_flpop_co';

    // Search & Limit Logic
    const keyword = query.keyword;
    const searchCondition = keyword
      ? `AND ${cfg.nameField} LIKE '%${keyword}%'`
      : '';
    const limitCondition = keyword ? '' : 'LIMIT 100';

    // 3. Fetch Ranking (Current Q)
    const isCombined =
      query.ageGroup &&
      query.ageGroup !== 'total' &&
      query.timeSlot &&
      query.timeSlot !== 'total';

    if (isCombined) {
      // Case A: Combined Filter (Approximation: Age * Time / Total)
      const ageCol =
        query.ageGroup === '60'
          ? '"agrde_60_above_flpop_co"'
          : `"agrde_${query.ageGroup}_flpop_co"`;

      const tMap: Record<string, string> = {
        '00': 'tmzon_00_06_flpop_co',
        '06': 'tmzon_06_11_flpop_co',
        '11': 'tmzon_11_14_flpop_co',
        '14': 'tmzon_14_17_flpop_co',
        '17': 'tmzon_17_21_flpop_co',
        '21': 'tmzon_21_24_flpop_co',
      };
      const timeCol = `"${tMap[query.timeSlot!] || 'tot_flpop_co'}"`;

      const sql = `
            SELECT 
              ${cfg.codeField} as code,
              ${cfg.nameField} as name,
              (CAST(${ageCol} AS NUMERIC) * CAST(${timeCol} AS NUMERIC) / NULLIF(CAST(tot_flpop_co AS NUMERIC), 0)) as amount,
              tot_flpop_co as metric_val
            FROM ${cfg.table}
            WHERE stdr_yyqu_cd = '${currentQ}' ${searchCondition}
            ORDER BY amount DESC
            ${limitCondition}
          `;

      try {
        const results = await this.prisma.$queryRawUnsafe<any[]>(sql);
        items = results.map((r) => ({
          code: r.code,
          name: r.name,
          amount: Math.round(Number(r.amount)),
          currentMetricVal: Number(r.metric_val),
        }));
      } catch (e) {
        this.logger.error('Failed combined ranking query', e);
        items = [];
      }
      metricField = 'tot_flpop_co';
    } else {
      // Case B: Single or No Filter
      if (query.ageGroup && query.ageGroup !== 'total') {
        metricField =
          query.ageGroup === '60'
            ? 'agrde_60_above_flpop_co'
            : `agrde_${query.ageGroup}_flpop_co`;
      } else if (query.timeSlot && query.timeSlot !== 'total') {
        const timeMap: Record<string, string> = {
          '00': 'tmzon_00_06_flpop_co',
          '06': 'tmzon_06_11_flpop_co',
          '11': 'tmzon_11_14_flpop_co',
          '14': 'tmzon_14_17_flpop_co',
          '17': 'tmzon_17_21_flpop_co',
          '21': 'tmzon_21_24_flpop_co',
        };
        if (timeMap[query.timeSlot]) metricField = timeMap[query.timeSlot];
      }

      // Prisma findMany doesn't support dynamic WHERE easily with mixed types, using Raw for search consistecy if keyword exists
      // But findMany is safer. Let's construct where object.
      const where: any = { stdr_yyqu_cd: currentQ };
      if (keyword) {
        where[cfg.nameField] = { contains: keyword };
      }

      const results = await (this.prisma as any)[cfg.model].findMany({
        where,
        orderBy: { [metricField]: 'desc' },
        take: keyword ? undefined : 100, // Remove limit if searching
      });

      items = results.map((r: any) => ({
        code: r[cfg.codeField],
        name: r[cfg.nameField],
        amount: Number(r[metricField]),
        currentMetricVal: Number(r[metricField]),
      }));
    }

    if (items.length === 0) return [];

    // 4. Fetch Details for Fluctuation & Status
    const codes = items.map((i) => i.code);

    // Previous Quarter Data (for Fluctuation)
    const prevData = await (this.prisma as any)[cfg.model].findMany({
      where: { stdr_yyqu_cd: prevQ, [cfg.codeField]: { in: codes } },
      select: { [cfg.codeField]: true, [metricField]: true },
    });

    // Commercial Status Data
    const statusData = await (this.prisma as any)[cfg.changeModel].findMany({
      where: { stdr_yyqu_cd: currentQ, [cfg.codeField]: { in: codes } },
      select: { [cfg.codeField]: true, trdar_chnge_ix: true },
    });

    // 5. Merge
    return items.map((item) => {
      const prev = prevData.find((p: any) => p[cfg.codeField] === item.code);
      const status = statusData.find(
        (s: any) => s[cfg.codeField] === item.code,
      );

      // Fluctuation Calculation
      let fluctuationRate = 0;
      const currentVal = item.currentMetricVal || 0;
      const prevVal = prev ? Number(prev[metricField]) : 0;

      if (prevVal > 0) {
        fluctuationRate = ((currentVal - prevVal) / prevVal) * 100;
        fluctuationRate = Number(fluctuationRate.toFixed(1));
      }

      return {
        code: item.code,
        name: item.name,
        amount: item.amount,
        count: 0,
        changeType: status?.trdar_chnge_ix,
        fluctuationRate,
      };
    });
  }

  private getPreviousQuarter(current: string): string {
    const year = parseInt(current.substring(0, 4));
    const quarter = parseInt(current.substring(4, 5));
    if (quarter === 1) return `${year - 1}4`;
    return `${year}${quarter - 1}`;
  }

  /**
   * MZ세대(10-30대) 비중 기준 랭킹
   */
  async findMZRanking(
    level: 'gu' | 'dong' | 'commercial' = 'commercial',
    keyword?: string, // 추가
  ): Promise<PopulationRankingItemDto[]> {
    const configMap = {
      gu: {
        table: 'foot_traffic_gu',
        codeField: 'signgu_cd',
        nameField: 'signgu_cd_nm',
        changeTable: 'commercial_change_gu',
      },
      dong: {
        table: 'foot_traffic_dong',
        codeField: 'adstrd_cd',
        nameField: 'adstrd_cd_nm',
        changeTable: 'commercial_change_dong',
      },
      commercial: {
        table: 'foot_traffic_commercial',
        codeField: 'trdar_cd',
        nameField: 'trdar_cd_nm',
        changeTable: 'commercial_change_commercial',
      },
    };
    const cfg = configMap[level];

    const searchCondition = keyword
      ? `AND f.${cfg.nameField} LIKE '%${keyword}%'`
      : '';
    const limitCondition = keyword ? '' : 'LIMIT 100';

    const sql = `
      WITH latest_quarter AS (
        SELECT MAX(stdr_yyqu_cd) as q FROM ${cfg.table}
      )
      SELECT 
        f.${cfg.codeField} as code,
        f.${cfg.nameField} as name,
        (COALESCE(f.agrde_10_flpop_co, 0) + COALESCE(f.agrde_20_flpop_co, 0) + COALESCE(f.agrde_30_flpop_co, 0)) as mz_pop,
        f.tot_flpop_co as total_pop,
        CASE WHEN f.tot_flpop_co > 0 
          THEN ROUND((COALESCE(f.agrde_10_flpop_co, 0) + COALESCE(f.agrde_20_flpop_co, 0) + COALESCE(f.agrde_30_flpop_co, 0))::numeric / f.tot_flpop_co * 100, 1)
          ELSE 0 
        END as mz_ratio,
        c.trdar_chnge_ix as change_type
      FROM ${cfg.table} f
      CROSS JOIN latest_quarter lq
      LEFT JOIN ${cfg.changeTable} c ON f.${cfg.codeField} = c.${cfg.codeField} AND c.stdr_yyqu_cd = lq.q
      WHERE f.stdr_yyqu_cd = lq.q ${searchCondition}
      ORDER BY mz_pop DESC, mz_ratio DESC
      ${limitCondition}
    `;

    try {
      const results = await this.prisma.$queryRawUnsafe<MZRankingRow[]>(sql);
      return results.map((r) => ({
        code: r.code,
        name: r.name,
        amount: Number(r.mz_pop),
        count: 0,
        changeType: r.change_type || undefined,
        fluctuationRate: Number(r.mz_ratio), // MZ 비중을 fluctuationRate로 활용
      }));
    } catch (e) {
      this.logger.error('Failed MZ ranking query', e);
      return [];
    }
  }

  /**
   * 성별 비중 기준 랭킹
   */
  async findGenderRanking(
    level: 'gu' | 'dong' | 'commercial' = 'commercial',
    gender: 'male' | 'female' = 'female',
    keyword?: string, // 추가
  ): Promise<PopulationRankingItemDto[]> {
    const configMap = {
      gu: {
        table: 'foot_traffic_gu',
        codeField: 'signgu_cd',
        nameField: 'signgu_cd_nm',
        changeTable: 'commercial_change_gu',
      },
      dong: {
        table: 'foot_traffic_dong',
        codeField: 'adstrd_cd',
        nameField: 'adstrd_cd_nm',
        changeTable: 'commercial_change_dong',
      },
      commercial: {
        table: 'foot_traffic_commercial',
        codeField: 'trdar_cd',
        nameField: 'trdar_cd_nm',
        changeTable: 'commercial_change_commercial',
      },
    };
    const cfg = configMap[level];
    const genderCol = gender === 'male' ? 'ml_flpop_co' : 'fml_flpop_co';

    const searchCondition = keyword
      ? `AND f.${cfg.nameField} LIKE '%${keyword}%'`
      : '';
    const limitCondition = keyword ? '' : 'LIMIT 100';

    const sql = `
      WITH latest_quarter AS (
        SELECT MAX(stdr_yyqu_cd) as q FROM ${cfg.table}
      )
      SELECT 
        f.${cfg.codeField} as code,
        f.${cfg.nameField} as name,
        f.${genderCol} as gender_pop,
        f.tot_flpop_co as total_pop,
        CASE WHEN f.tot_flpop_co > 0 
          THEN ROUND(f.${genderCol}::numeric / f.tot_flpop_co * 100, 1)
          ELSE 0 
        END as gender_ratio,
        c.trdar_chnge_ix as change_type
      FROM ${cfg.table} f
      CROSS JOIN latest_quarter lq
      LEFT JOIN ${cfg.changeTable} c ON f.${cfg.codeField} = c.${cfg.codeField} AND c.stdr_yyqu_cd = lq.q
      WHERE f.stdr_yyqu_cd = lq.q ${searchCondition}
      ORDER BY gender_ratio DESC, gender_pop DESC
      ${limitCondition}
    `;

    try {
      const results =
        await this.prisma.$queryRawUnsafe<GenderRankingRow[]>(sql);
      return results.map((r) => ({
        code: r.code,
        name: r.name,
        amount: Number(r.gender_pop),
        count: 0,
        changeType: r.change_type || undefined,
        fluctuationRate: Number(r.gender_ratio), // 성별 비중을 fluctuationRate로 활용
      }));
    } catch (e) {
      this.logger.error('Failed gender ranking query', e);
      return [];
    }
  }
}
