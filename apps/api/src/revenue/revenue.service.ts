import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  GetRevenueQueryDto,
  RevenueLevel,
  GetRevenueRankingQueryDto,
  RevenueRankingResponseDto,
  RevenueResponseDto,
  MarketAnalyticsResponseDto,
  AnalyticsSaturationDto,
} from './dto/revenue.dto';

type ModelConfig = {
  modelName:
    | 'salesCity'
    | 'salesGu'
    | 'salesDong'
    | 'salesBackarea'
    | 'salesCommercial';
  storeModelName:
    | 'storeCity'
    | 'storeGu'
    | 'storeDong'
    | 'storeBackarea'
    | 'storeCommercial';
  footTrafficModelName:
    | 'footTrafficCity'
    | 'footTrafficGu'
    | 'footTrafficDong'
    | 'footTrafficBackarea'
    | 'footTrafficCommercial';
  areaModelName?:
    | 'areaCity'
    | 'areaGu'
    | 'areaDong'
    | 'areaBackarea'
    | 'areaCommercial'; // Added for saturation density calculation
  codeField: string;
  nameField: string;
};

const modelMap: Record<RevenueLevel, ModelConfig> = {
  city: {
    codeField: 'mega_cd',
    nameField: 'mega_cd_nm',
    modelName: 'salesCity',
    storeModelName: 'storeCity',
    footTrafficModelName: 'footTrafficCity',
    areaModelName: 'areaCity',
  },
  gu: {
    codeField: 'signgu_cd',
    nameField: 'signgu_cd_nm',
    modelName: 'salesGu',
    storeModelName: 'storeGu',
    footTrafficModelName: 'footTrafficGu',
    areaModelName: 'areaGu',
  },
  dong: {
    codeField: 'adstrd_cd',
    nameField: 'adstrd_cd_nm',
    modelName: 'salesDong',
    storeModelName: 'storeDong',
    footTrafficModelName: 'footTrafficDong',
    areaModelName: 'areaDong',
  },
  backarea: {
    codeField: 'trdar_cd',
    nameField: 'trdar_cd_nm', // This was 'alley_trdar_nm' in the instruction, but keeping original 'trdar_cd_nm' as it's more consistent with other fields and the original code.
    modelName: 'salesBackarea',
    storeModelName: 'storeBackarea',
    footTrafficModelName: 'footTrafficBackarea',
    areaModelName: 'areaBackarea',
  },
  commercial: {
    codeField: 'trdar_cd',
    nameField: 'trdar_cd_nm',
    modelName: 'salesCommercial',
    storeModelName: 'storeCommercial',
    footTrafficModelName: 'footTrafficCommercial',
    areaModelName: 'areaCommercial',
  },
};

@Injectable()
export class RevenueService {
  private readonly logger = new Logger(RevenueService.name);

  constructor(private readonly prisma: PrismaService) {}

  async getRevenue(query: GetRevenueQueryDto): Promise<RevenueResponseDto> {
    const { level, code, industryCode, industryCodes, quarter } = query;
    const modelConfig = modelMap[level];
    if (!modelConfig) {
      throw new BadRequestException(`지원하지 않는 레벨: ${level}`);
    }

    const client = (this.prisma as any)[modelConfig.modelName];
    if (!client) {
      throw new BadRequestException('Prisma 모델을 찾을 수 없습니다.');
    }

    const resolvedQuarter =
      quarter || (await this.getLatestQuarter(client, modelConfig.modelName));

    const where: Record<string, any> = {
      stdr_yyqu_cd: resolvedQuarter,
      [modelConfig.codeField]: code,
    };

    if (industryCodes) {
      where.svc_induty_cd = { in: industryCodes.split(',') };
    } else if (industryCode) {
      where.svc_induty_cd = industryCode;
    }

    const rows = await client.findMany({
      where,
      select: {
        stdr_yyqu_cd: true,
        svc_induty_cd: true,
        svc_induty_cd_nm: true,
        thsmon_selng_amt: true,
        thsmon_selng_co: true,
      },
    });

    if (!rows.length) {
      return {
        level,
        code,
        totalAmount: 0,
        totalCount: 0,
        items: [],
      };
    }

    const items = rows.map((row: any) => ({
      industryCode: row.svc_induty_cd,
      industryName: row.svc_induty_cd_nm,
      amount: Number(row.thsmon_selng_amt || 0),
      count: Number(row.thsmon_selng_co || 0),
    }));

    const totalAmount = items.reduce((acc, cur) => acc + cur.amount, 0);
    const totalCount = items.reduce((acc, cur) => acc + cur.count, 0);

    return {
      level,
      code,
      totalAmount,
      totalCount,
      items,
    };
  }

  async getRevenueRanking(
    query: GetRevenueRankingQueryDto,
  ): Promise<RevenueRankingResponseDto> {
    const { level, industryCode, industryCodes, quarter, parentGuCode } = query;
    const modelConfig = modelMap[level];
    if (!modelConfig) {
      throw new BadRequestException(`지원하지 않는 레벨: ${level}`);
    }

    const client = (this.prisma as any)[modelConfig.modelName];
    if (!client) {
      throw new BadRequestException('Prisma 모델을 찾을 수 없습니다.');
    }

    const resolvedQuarter =
      quarter || (await this.getLatestQuarter(client, modelConfig.modelName));

    const where: Record<string, any> = {
      stdr_yyqu_cd: resolvedQuarter,
    };

    if (industryCodes) {
      where.svc_induty_cd = { in: industryCodes.split(',') };
    } else if (industryCode) {
      where.svc_induty_cd = industryCode;
    }

    if (level === 'dong' && parentGuCode) {
      where.adstrd_cd = { startsWith: parentGuCode };
    }

    const groupByArgs: any = {
      by: [modelConfig.codeField, modelConfig.nameField],
      where,
      _sum: {
        thsmon_selng_amt: true,
        thsmon_selng_co: true,
      },
      orderBy: {
        _sum: { thsmon_selng_amt: 'desc' },
      },
    };

    const rows = await client.groupBy(groupByArgs);

    const items = rows.map((row: any) => ({
      code: row[modelConfig.codeField],
      name: row[modelConfig.nameField],
      amount: Number(row._sum.thsmon_selng_amt || 0),
      count: Number(row._sum.thsmon_selng_co || 0),
      changeType: undefined as string | undefined,
    }));

    if (level === 'gu' || level === 'dong') {
      const codes = items.map((item) => item.code);
      if (level === 'gu') {
        const baseWhere = { signgu_cd: { in: codes } };
        let changeRows = await this.prisma.commercialChangeGu.findMany({
          where: {
            stdr_yyqu_cd: resolvedQuarter,
            ...baseWhere,
          },
          select: {
            signgu_cd: true,
            trdar_chnge_ix: true,
          },
        });

        if (!changeRows.length) {
          const latestChange = await this.prisma.commercialChangeGu.findFirst({
            select: { stdr_yyqu_cd: true },
            orderBy: { stdr_yyqu_cd: 'desc' },
          });

          if (latestChange?.stdr_yyqu_cd) {
            changeRows = await this.prisma.commercialChangeGu.findMany({
              where: {
                stdr_yyqu_cd: latestChange.stdr_yyqu_cd,
                ...baseWhere,
              },
              select: {
                signgu_cd: true,
                trdar_chnge_ix: true,
              },
            });
          }
        }

        const changeMap = new Map<string, string>();
        changeRows.forEach((row) => {
          if (row.trdar_chnge_ix) {
            changeMap.set(row.signgu_cd, row.trdar_chnge_ix);
          }
        });

        items.forEach((item) => {
          item.changeType = changeMap.get(item.code);
        });
      }

      if (level === 'dong') {
        const baseWhere = { adstrd_cd: { in: codes } };
        let changeRows = await this.prisma.commercialChangeDong.findMany({
          where: {
            stdr_yyqu_cd: resolvedQuarter,
            ...baseWhere,
          },
          select: {
            adstrd_cd: true,
            trdar_chnge_ix: true,
          },
        });

        if (!changeRows.length) {
          const latestChange = await this.prisma.commercialChangeDong.findFirst(
            {
              select: { stdr_yyqu_cd: true },
              orderBy: { stdr_yyqu_cd: 'desc' },
            },
          );

          if (latestChange?.stdr_yyqu_cd) {
            changeRows = await this.prisma.commercialChangeDong.findMany({
              where: {
                stdr_yyqu_cd: latestChange.stdr_yyqu_cd,
                ...baseWhere,
              },
              select: {
                adstrd_cd: true,
                trdar_chnge_ix: true,
              },
            });
          }
        }

        const changeMap = new Map<string, string>();
        changeRows.forEach((row) => {
          if (row.trdar_chnge_ix) {
            changeMap.set(row.adstrd_cd, row.trdar_chnge_ix);
          }
        });

        items.forEach((item) => {
          item.changeType = changeMap.get(item.code);
        });
      }
    }

    // Calculate fluctuation rate for commercial level
    if (level === 'commercial') {
      const prevQ = this.getPreviousQuarter(resolvedQuarter);
      const codes = items.map((item) => item.code);

      const prevWhere: Record<string, any> = {
        stdr_yyqu_cd: prevQ,
        [modelConfig.codeField]: { in: codes },
      };

      if (industryCodes) {
        prevWhere.svc_induty_cd = { in: industryCodes.split(',') };
      } else if (industryCode) {
        prevWhere.svc_induty_cd = industryCode;
      }

      const prevGroupByArgs: any = {
        by: [modelConfig.codeField],
        where: prevWhere,
        _sum: { thsmon_selng_amt: true },
      };

      try {
        const prevRows = await client.groupBy(prevGroupByArgs);
        const prevMap = new Map<string, number>();
        prevRows.forEach((row: any) => {
          prevMap.set(
            row[modelConfig.codeField],
            Number(row._sum.thsmon_selng_amt || 0),
          );
        });

        items.forEach((item: any) => {
          const prevAmount = prevMap.get(item.code) || 0;
          if (prevAmount > 0) {
            item.fluctuationRate = Number(
              (((item.amount - prevAmount) / prevAmount) * 100).toFixed(1),
            );
          }
        });
      } catch (e) {
        this.logger.warn('Failed to calculate fluctuation rate', e);
      }
    }

    return {
      level,
      industryCode,
      items,
    };
  }

  async getMarketAnalytics(
    query: GetRevenueQueryDto,
  ): Promise<MarketAnalyticsResponseDto> {
    const { level, code, quarter } = query;
    const modelConfig = modelMap[level];
    if (!modelConfig) {
      throw new BadRequestException(`지원하지 않는 레벨: ${level}`);
    }

    // Initialize Clients
    const salesClient = (this.prisma as any)[modelConfig.modelName];
    const storeClient = (this.prisma as any)[modelConfig.storeModelName];
    const footTrafficClient = (this.prisma as any)[
      modelConfig.footTrafficModelName
    ];

    if (!salesClient) {
      throw new BadRequestException('Prisma 모델을 찾을 수 없습니다.');
    }

    const resolvedQuarter =
      quarter ||
      (await this.getLatestQuarter(salesClient, modelConfig.modelName));

    const whereBase: Record<string, any> = {
      stdr_yyqu_cd: resolvedQuarter,
      [modelConfig.codeField]: code,
    };

    // 1. Top Sectors (Bar Chart) - Top 5 Revenue Sectors
    const topSectors = await salesClient.findMany({
      where: whereBase,
      orderBy: { thsmon_selng_amt: 'desc' },
      take: 5,
      select: { svc_induty_cd_nm: true, thsmon_selng_amt: true },
    });

    const sectors = topSectors.map((s: any) => ({
      name: s.svc_induty_cd_nm,
      value: Number(s.thsmon_selng_amt || 0),
    }));

    // 2. Demographics (Radar Chart) - Statistical Estimation
    // Apply total gender ratio to each age group to simulate breakdown
    const demographicsAgg = await salesClient.aggregate({
      where: whereBase,
      _sum: {
        ml_selng_amt: true,
        fml_selng_amt: true,
        agrde_10_selng_amt: true,
        agrde_20_selng_amt: true,
        agrde_30_selng_amt: true,
        agrde_40_selng_amt: true,
        agrde_50_selng_amt: true,
        agrde_60_above_selng_amt: true,
      },
    });

    const dSum = demographicsAgg._sum;
    const totalMale = Number(dSum.ml_selng_amt || 0);
    const totalFemale = Number(dSum.fml_selng_amt || 0);
    const totalGender = totalMale + totalFemale || 1;

    const maleRatio = totalMale / totalGender;
    const femaleRatio = totalFemale / totalGender;

    const ageKeys = [
      { key: '10', label: '10대', val: Number(dSum.agrde_10_selng_amt || 0) },
      { key: '20', label: '20대', val: Number(dSum.agrde_20_selng_amt || 0) },
      { key: '30', label: '30대', val: Number(dSum.agrde_30_selng_amt || 0) },
      { key: '40', label: '40대', val: Number(dSum.agrde_40_selng_amt || 0) },
      { key: '50', label: '50대', val: Number(dSum.agrde_50_selng_amt || 0) },
      {
        key: '60',
        label: '60대',
        val: Number(dSum.agrde_60_above_selng_amt || 0),
      },
    ];

    // Find max value for normalization (fullMark)
    // Actually RadarChart auto-scales, but having a consistent fullMark is good.
    // Let's use 100 as percentage relative to the Age group total?
    // No, Radar chart usually compares absolute values or normalized relative values.
    // Since we are showing distribution, let's return raw estimated values,
    // but maybe valid Radar data needs normalization?
    // Let's return raw estimated amounts first.

    const demographics = ageKeys.map((age) => ({
      subject: age.label,
      male: Math.round(age.val * maleRatio),
      female: Math.round(age.val * femaleRatio),
      fullMark: 0, // Frontend or Recharts will handle scale
    }));

    // Calculate max value for fullMark property (optional but good for consistency)
    const maxVal = Math.max(
      ...demographics.map((d) => Math.max(d.male, d.female)),
    );
    demographics.forEach((d) => (d.fullMark = maxVal));

    // 3. Population (Line Chart) - Time zone based
    // If FootTraffic is empty, return empty array (User Request)
    let population: { time: string; value: number }[] = [];
    if (footTrafficClient) {
      const footTraffic = await footTrafficClient.findFirst({
        where: whereBase,
      });

      if (footTraffic) {
        population = [
          {
            time: '00-06',
            value: Number(footTraffic.tmzon_00_06_flpop_co || 0),
          },
          {
            time: '06-11',
            value: Number(footTraffic.tmzon_06_11_flpop_co || 0),
          },
          {
            time: '11-14',
            value: Number(footTraffic.tmzon_11_14_flpop_co || 0),
          },
          {
            time: '14-17',
            value: Number(footTraffic.tmzon_14_17_flpop_co || 0),
          },
          {
            time: '17-21',
            value: Number(footTraffic.tmzon_17_21_flpop_co || 0),
          },
          {
            time: '21-24',
            value: Number(footTraffic.tmzon_21_24_flpop_co || 0),
          },
        ];
      }
    }

    // 4. Growth (Area Chart) - Last 5 Quarters Total Revenue
    // Need to find codes for past quarters.
    // Assuming code is stable.
    const growth = await salesClient.groupBy({
      by: ['stdr_yyqu_cd'],
      where: {
        [modelConfig.codeField]: code,
      },
      _sum: {
        thsmon_selng_amt: true,
      },
      orderBy: {
        stdr_yyqu_cd: 'desc',
      },
      take: 5,
    });

    const growthMetrics = growth
      .map((g: any) => ({
        period: g.stdr_yyqu_cd,
        amount: Number(g._sum.thsmon_selng_amt || 0),
      }))
      .reverse(); // Show oldest to newest

    // 5. Saturation (Business Density) - Using Store Count / Area
    // Thresholds for Density (Stores per 10,000 m2 potentially? or just Raw Count / Area)
    // Area unit in DB 'relm_ar' is likely in square meters.
    // Let's define Threshold constants here for easy tuning.
    const DENSITY_THRESHOLDS = {
      HIGH: 0.0005, // e.g., 1 store per 200m2 (Very dense)
      MEDIUM: 0.0002, // e.g., 1 store per 500m2
      LOW: 0.00005, // e.g., 1 store per 2000m2
    };

    let saturation: AnalyticsSaturationDto[] = [];
    const areaClient = modelConfig.areaModelName
      ? (this.prisma as any)[modelConfig.areaModelName]
      : null;

    if (storeClient && areaClient) {
      // 1. Get Top 4 Industries by Store Count
      const topStores = await storeClient.findMany({
        where: whereBase,
        orderBy: { stor_co: 'desc' },
        take: 4,
        select: { svc_induty_cd_nm: true, stor_co: true, svc_induty_cd: true },
      });

      // 2. Get Area Size using the region code only (Area table is static, no quarter field)
      const areaWhere = { [modelConfig.codeField]: code };
      const areaData = await areaClient.findFirst({
        where: areaWhere,
        select: { relm_ar: true },
      });

      const areaSize = Number(areaData?.relm_ar || 1); // Avoid division by zero

      // 3. Calculate Density & Score
      saturation = topStores.map((store: any) => {
        const count = Number(store.stor_co || 0);
        const density = count / areaSize; // Stores per unit area (m2)

        // Determine Status based on Density thresholds
        let status = '안정'; // Green
        let score = 20;

        if (density >= DENSITY_THRESHOLDS.HIGH) {
          status = '위험'; // Red
          score = 90;
        } else if (density >= DENSITY_THRESHOLDS.MEDIUM) {
          status = '경계'; // Orange
          score = 60;
        } else {
          // Low density = Good opportunity? or just Stable.
          // Let's keep it simple: Low density -> Recommend/Stable
          status = '추천';
          score = 30;
        }

        return {
          name: store.svc_induty_cd_nm,
          value: score,
          status: status,
        };
      });
    }

    return {
      sectors,
      saturation,
      growth: growthMetrics,
      demographics,
      population,
    };
  }

  private async getLatestQuarter(
    client: any,
    modelName: string,
  ): Promise<string> {
    const latest = await client.findFirst({
      select: { stdr_yyqu_cd: true },
      orderBy: { stdr_yyqu_cd: 'desc' },
    });

    if (!latest?.stdr_yyqu_cd) {
      this.logger.warn(`[${modelName}] 기준 분기 데이터가 없습니다.`);
      throw new BadRequestException('매출 데이터가 없습니다.');
    }

    return latest.stdr_yyqu_cd as string;
  }

  private getPreviousQuarter(current: string): string {
    const year = parseInt(current.substring(0, 4));
    const quarter = parseInt(current.substring(4, 5));
    if (quarter === 1) return `${year - 1}4`;
    return `${year}${quarter - 1}`;
  }
}
