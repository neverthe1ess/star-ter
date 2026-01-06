import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ReportRepository {
  constructor(private readonly prisma: PrismaService) {}

  async getLatestSales(regionCode: string, industryCode: string) {
    const area = await this.resolveArea(regionCode);
    if (!area) return null;

    if (area.type === 'dong') {
      return this.prisma.salesDong.findFirst({
        where: { adstrd_cd: area.code, svc_induty_cd: industryCode },
        orderBy: { stdr_yyqu_cd: 'desc' },
      });
    } else if (area.type === 'commercial') {
      return this.prisma.salesCommercial.findFirst({
        where: { trdar_cd: area.code, svc_induty_cd: industryCode },
        orderBy: { stdr_yyqu_cd: 'desc' },
      });
    } else {
      return this.prisma.salesBackarea.findFirst({
        where: { trdar_cd: area.code, svc_induty_cd: industryCode },
        orderBy: { stdr_yyqu_cd: 'desc' },
      });
    }
  }

  async getLatestFootTraffic(regionCode: string) {
    const area = await this.resolveArea(regionCode);
    if (!area) return null;

    if (area.type === 'dong') {
      return this.prisma.footTrafficDong.findFirst({
        where: { adstrd_cd: area.code },
        orderBy: { stdr_yyqu_cd: 'desc' },
      });
    } else if (area.type === 'commercial') {
      return this.prisma.footTrafficCommercial.findFirst({
        where: { trdar_cd: area.code },
        orderBy: { stdr_yyqu_cd: 'desc' },
      });
    } else {
      return this.prisma.footTrafficBackarea.findFirst({
        where: { trdar_cd: area.code },
        orderBy: { stdr_yyqu_cd: 'desc' },
      });
    }
  }

  async getStoreDensity(regionCode: string, industryCode: string) {
    const area = await this.resolveArea(regionCode);
    if (!area) return null;

    if (area.type === 'dong') {
      return this.prisma.storeDong.findFirst({
        where: { adstrd_cd: area.code, svc_induty_cd: industryCode },
        orderBy: { stdr_yyqu_cd: 'desc' },
      });
    } else if (area.type === 'commercial') {
      return this.prisma.storeCommercial.findFirst({
        where: { trdar_cd: area.code, svc_induty_cd: industryCode },
        orderBy: { stdr_yyqu_cd: 'desc' },
      });
    } else {
      return this.prisma.storeBackarea.findFirst({
        where: { trdar_cd: area.code, svc_induty_cd: industryCode },
        orderBy: { stdr_yyqu_cd: 'desc' },
      });
    }
  }

  async getAreaName(regionCode: string) {
    const area = await this.resolveArea(regionCode);
    if (!area) return null;

    if (area.type === 'dong') {
      const data = await this.prisma.areaDong.findUnique({
        where: { adstrd_cd: area.code },
        select: { adstrd_nm: true },
      });
      return data ? { adstrd_nm: data.adstrd_nm } : null;
    } else if (area.type === 'commercial') {
      // 1차: areaCommercial에서 조회
      const data = await this.prisma.areaCommercial.findUnique({
        where: { trdar_cd: area.code },
        select: { trdar_cd_nm: true },
      });
      if (data) return { adstrd_nm: data.trdar_cd_nm };

      // 2차: 관광특구 등 areaCommercial에 없는 경우 salesCommercial에서 이름 조회
      const salesData = await this.prisma.salesCommercial.findFirst({
        where: { trdar_cd: area.code },
        select: { trdar_cd_nm: true },
      });
      return salesData ? { adstrd_nm: salesData.trdar_cd_nm } : null;
    } else {
      const data = await this.prisma.areaBackarea.findUnique({
        where: { alley_trdar_cd: area.code },
        select: { alley_trdar_nm: true },
      });
      return data ? { adstrd_nm: data.alley_trdar_nm } : null;
    }
  }

  async getIndustryName(industryCode: string) {
    const industry = await this.prisma.service_industry.findUnique({
      where: { service_industry_cd: industryCode },
      select: { service_industry_nm: true },
    });
    return industry;
  }

  async getLatestIncome(regionCode: string) {
    const area = await this.resolveArea(regionCode);
    if (!area) return null;

    if (area.type === 'dong') {
      return this.prisma.incomeConsumptionDong.findFirst({
        where: { adstrd_cd: area.code },
        orderBy: { stdr_yyqu_cd: 'desc' },
      });
    } else if (area.type === 'commercial') {
      return this.prisma.incomeConsumptionCommercial.findFirst({
        where: { trdar_cd: area.code },
        orderBy: { stdr_yyqu_cd: 'desc' },
      });
    } else {
      return this.prisma.incomeConsumptionBackarea.findFirst({
        where: { trdar_cd: area.code },
        orderBy: { stdr_yyqu_cd: 'desc' },
      });
    }
  }

  async getTopIndustriesInArea(regionCode: string) {
    const area = await this.resolveArea(regionCode);
    if (!area) return [];

    if (area.type === 'dong') {
      return this.prisma.storeDong.findMany({
        where: { adstrd_cd: area.code },
        orderBy: [{ stdr_yyqu_cd: 'desc' }, { stor_co: 'desc' }],
        take: 10,
      });
    } else if (area.type === 'commercial') {
      return this.prisma.storeCommercial.findMany({
        where: { trdar_cd: area.code },
        orderBy: [{ stdr_yyqu_cd: 'desc' }, { stor_co: 'desc' }],
        take: 10,
      });
    } else {
      return this.prisma.storeBackarea.findMany({
        where: { trdar_cd: area.code },
        orderBy: [{ stdr_yyqu_cd: 'desc' }, { stor_co: 'desc' }],
        take: 10,
      });
    }
  }

  async getTopIndustriesBySales(regionCode: string) {
    const area = await this.resolveArea(regionCode);
    if (!area) return [];

    const orderBy = [
      { stdr_yyqu_cd: 'desc' as const },
      { thsmon_selng_amt: 'desc' as const },
    ];
    const select = {
      svc_induty_cd: true,
      svc_induty_cd_nm: true,
      thsmon_selng_amt: true,
    };

    if (area.type === 'dong') {
      return this.prisma.salesDong.findMany({
        where: { adstrd_cd: area.code },
        orderBy,
        take: 10,
        select,
      });
    } else if (area.type === 'commercial') {
      return this.prisma.salesCommercial.findMany({
        where: { trdar_cd: area.code },
        orderBy,
        take: 10,
        select,
      });
    } else {
      return this.prisma.salesBackarea.findMany({
        where: { trdar_cd: area.code },
        orderBy,
        take: 10,
        select,
      });
    }
  }

  private async resolveArea(code: string): Promise<{
    type: 'dong' | 'commercial' | 'backarea';
    code: string;
  } | null> {
    const variants = [code];
    if (code.length === 8) variants.push(code + '00');
    if (code.length === 10 && code.endsWith('00'))
      variants.push(code.substring(0, 8));

    // 1. 행정동 조회
    for (const v of variants) {
      const dong = await this.prisma.areaDong.findUnique({
        where: { adstrd_cd: v },
        select: { adstrd_cd: true },
      });
      if (dong) return { type: 'dong', code: v };
    }

    // 2. 상권 조회
    for (const v of variants) {
      const comm = await this.prisma.areaCommercial.findUnique({
        where: { trdar_cd: v },
        select: { trdar_cd: true },
      });
      if (comm) return { type: 'commercial', code: v };
    }

    // 3. 골목상권 조회
    for (const v of variants) {
      const back = await this.prisma.areaBackarea.findUnique({
        where: { alley_trdar_cd: v },
        select: { alley_trdar_cd: true },
      });
      if (back) return { type: 'backarea', code: v };
    }

    // 4. 폴백: salesCommercial에 데이터가 있는지 확인 (관광특구 등 area 테이블 누락 케이스)
    for (const v of variants) {
      const salesData = await this.prisma.salesCommercial.findFirst({
        where: { trdar_cd: v },
        select: { trdar_cd: true },
      });
      if (salesData) return { type: 'commercial', code: v };
    }

    return null;
  }

  async getAreaDetails(regionCode: string): Promise<{
    areaType: string;
    areaTypeName: string;
    guName: string;
    dongName: string;
    area: number;
  } | null> {
    const area = await this.resolveArea(regionCode);
    if (!area) return null;

    if (area.type === 'dong') {
      const dong = await this.prisma.areaDong.findUnique({
        where: { adstrd_cd: area.code },
        select: { adstrd_nm: true, relm_ar: true },
      });
      if (!dong) return null;

      // 동 이름에서 구 이름 추출 시도 (예: "강남구 역삼1동" -> "강남구")
      const parts = dong.adstrd_nm.split(' ');
      return {
        areaType: 'dong',
        areaTypeName: '행정동',
        guName: parts.length > 1 ? parts[0] : '',
        dongName: dong.adstrd_nm,
        area: dong.relm_ar || 0,
      };
    } else if (area.type === 'commercial') {
      const commercial = await this.prisma.areaCommercial.findUnique({
        where: { trdar_cd: area.code },
        select: {
          trdar_se_cd: true,
          trdar_se_cd_nm: true,
          signgu_cd_nm: true,
          adstrd_cd_nm: true,
          relm_ar: true,
        },
      });
      if (!commercial) return null;

      return {
        areaType: commercial.trdar_se_cd,
        areaTypeName: commercial.trdar_se_cd_nm,
        guName: commercial.signgu_cd_nm,
        dongName: commercial.adstrd_cd_nm,
        area: commercial.relm_ar || 0,
      };
    } else {
      // backarea
      const backarea = await this.prisma.areaBackarea.findUnique({
        where: { alley_trdar_cd: area.code },
        select: {
          signgu_cd_nm: true,
          adstrd_cd_nm: true,
          relm_ar: true,
        },
      });
      if (!backarea) return null;

      return {
        areaType: 'backarea',
        areaTypeName: '골목상권',
        guName: backarea.signgu_cd_nm,
        dongName: backarea.adstrd_cd_nm,
        area: backarea.relm_ar || 0,
      };
    }
  }
}
