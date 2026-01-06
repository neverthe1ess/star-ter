import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

// Repository: DB 접근 로직만 담당 (쿼리 실행)
@Injectable()
export class RevenueRepository {
  constructor(private readonly prisma: PrismaService) {}

  // Private Helper: 동적 Prisma 클라이언트 접근
  private getClient(modelName: string) {
    const client = (this.prisma as any)[modelName];
    if (!client) {
      throw new BadRequestException(`Prisma model '${modelName}' not found.`);
    }
    return client;
  }

  // 1. 최신 분기 조회
  async getLatestQuarter(modelName: string): Promise<string> {
    const client = this.getClient(modelName);
    const latest = await client.findFirst({
      select: { stdr_yyqu_cd: true },
      orderBy: { stdr_yyqu_cd: 'desc' },
    });
    if (!latest?.stdr_yyqu_cd) {
      throw new BadRequestException('매출 데이터가 없습니다.');
    }
    return latest.stdr_yyqu_cd;
  }

  // 2. 상위 업종 (Bar Chart) - Top 5 매출 업종
  async findTopSectors(modelName: string, where: Record<string, any>) {
    const client = this.getClient(modelName);
    return client.findMany({
      where,
      orderBy: { thsmon_selng_amt: 'desc' },
      take: 5,
      select: { svc_induty_cd_nm: true, thsmon_selng_amt: true },
    });
  }

  // 3. 인구 통계 (Radar Chart) - 성별/연령별 집계
  async getDemographics(modelName: string, where: Record<string, any>) {
    const client = this.getClient(modelName);
    return client.aggregate({
      where,
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
  }

  // 4. 유동인구 (Line Chart) - 시간대별
  async getFootTraffic(modelName: string, where: Record<string, any>) {
    const client = this.getClient(modelName);
    return client.findFirst({ where });
  }

  // 5. 매출 성장 추이 (Area Chart) - 최근 5분기
  async getGrowth(modelName: string, codeField: string, code: string) {
    const client = this.getClient(modelName);
    return client.groupBy({
      by: ['stdr_yyqu_cd'],
      where: { [codeField]: code },
      _sum: { thsmon_selng_amt: true },
      orderBy: { stdr_yyqu_cd: 'desc' },
      take: 5,
    });
  }

  // 6. 상위 점포 수 (Saturation) - Top 4 업종별 점포 수
  async findTopStores(modelName: string, where: Record<string, any>) {
    const client = this.getClient(modelName);
    return client.findMany({
      where,
      orderBy: { stor_co: 'desc' },
      take: 4,
      select: { svc_induty_cd_nm: true, stor_co: true, svc_induty_cd: true },
    });
  }

  // 7. 지역 면적 조회 (Saturation) - 밀도 계산용
  async getAreaSize(
    modelName: string | undefined,
    where: Record<string, any>,
  ): Promise<{ relm_ar: number } | null> {
    if (!modelName) return null;
    const client = this.getClient(modelName);
    return client.findFirst({
      where,
      select: { relm_ar: true },
    });
  }
}
