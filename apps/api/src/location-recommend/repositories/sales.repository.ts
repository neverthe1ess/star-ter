import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

export interface AggregatedSalesData {
  trdar_cd: string;
  trdar_cd_nm: string;
  thsmon_selng_amt: bigint;
  agrde_10_selng_amt: bigint;
  agrde_20_selng_amt: bigint;
  agrde_30_selng_amt: bigint;
  agrde_40_selng_amt: bigint;
  agrde_50_selng_amt: bigint;
  agrde_60_above_selng_amt: bigint;
  tmzon_00_06_selng_amt: bigint;
  tmzon_06_11_selng_amt: bigint;
  tmzon_11_14_selng_amt: bigint;
  tmzon_14_17_selng_amt: bigint;
  tmzon_17_21_selng_amt: bigint;
  tmzon_21_24_selng_amt: bigint;
}

@Injectable()
export class SalesRepository {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * 상권별 매출 데이터 집계 (전체 업종 합산)
   * SQL GROUP BY로 DB에서 집계하여 성능 최적화
   */
  async getAggregatedSalesByQuarter(
    quarter: string,
  ): Promise<AggregatedSalesData[]> {
    const result = await this.prisma.$queryRaw<AggregatedSalesData[]>`
      SELECT
        trdar_cd,
        MAX(trdar_cd_nm) AS trdar_cd_nm,
        COALESCE(SUM(thsmon_selng_amt), 0) AS thsmon_selng_amt,
        COALESCE(SUM(agrde_10_selng_amt), 0) AS agrde_10_selng_amt,
        COALESCE(SUM(agrde_20_selng_amt), 0) AS agrde_20_selng_amt,
        COALESCE(SUM(agrde_30_selng_amt), 0) AS agrde_30_selng_amt,
        COALESCE(SUM(agrde_40_selng_amt), 0) AS agrde_40_selng_amt,
        COALESCE(SUM(agrde_50_selng_amt), 0) AS agrde_50_selng_amt,
        COALESCE(SUM(agrde_60_above_selng_amt), 0) AS agrde_60_above_selng_amt,
        COALESCE(SUM(tmzon_00_06_selng_amt), 0) AS tmzon_00_06_selng_amt,
        COALESCE(SUM(tmzon_06_11_selng_amt), 0) AS tmzon_06_11_selng_amt,
        COALESCE(SUM(tmzon_11_14_selng_amt), 0) AS tmzon_11_14_selng_amt,
        COALESCE(SUM(tmzon_14_17_selng_amt), 0) AS tmzon_14_17_selng_amt,
        COALESCE(SUM(tmzon_17_21_selng_amt), 0) AS tmzon_17_21_selng_amt,
        COALESCE(SUM(tmzon_21_24_selng_amt), 0) AS tmzon_21_24_selng_amt
      FROM sales_commercial
      WHERE stdr_yyqu_cd = ${quarter}
      GROUP BY trdar_cd
    `;

    return result;
  }
}
