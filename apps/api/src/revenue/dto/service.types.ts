/**
 * Revenue Service 내부에서 사용하는 타입 정의
 */

import { RevenueLevel } from './revenue.dto';

/**
 * Prisma 모델 설정 타입
 */
export interface ModelConfig {
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
    | 'areaCommercial';
  codeField: string;
  nameField: string;
}

/**
 * 레벨별 모델 설정 맵
 */
export const modelMap: Record<RevenueLevel, ModelConfig> = {
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
    nameField: 'trdar_cd_nm',
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

/**
 * 매출 데이터 조회 결과 타입
 */
export interface RevenueRow {
  stdr_yyqu_cd: string;
  svc_induty_cd: string;
  svc_induty_cd_nm: string;
  thsmon_selng_amt: number | bigint;
  thsmon_selng_co: number | bigint;
}

/**
 * 매출 랭킹 그룹화 결과 타입
 */
export interface RevenueRankingRow {
  [key: string]: unknown;
  _sum: {
    thsmon_selng_amt: number | bigint;
    thsmon_selng_co: number | bigint;
  };
}

/**
 * 동적 Prisma 모델 타입
 */
export interface PrismaModel {
  findMany(args: {
    where?: Record<string, unknown>;
    select?: Record<string, boolean>;
    distinct?: string[];
  }): Promise<Record<string, unknown>[]>;
  findFirst(args: {
    select?: Record<string, boolean>;
    orderBy?: Record<string, 'asc' | 'desc'>;
  }): Promise<Record<string, unknown> | null>;
  groupBy(args: {
    by: string[];
    where?: Record<string, unknown>;
    _sum?: Record<string, boolean>;
    orderBy?: Record<string, unknown>;
    take?: number;
  }): Promise<Record<string, Record<string, unknown>>[]>;
}
