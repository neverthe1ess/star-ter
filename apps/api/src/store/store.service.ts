import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MarketRepository } from '../market/market.repository';
import {
  GetStoreQueryDto,
  StoreLevel,
  StoreResponseDto,
  GetStoreLocationsQueryDto,
  StoreLocationsResponseDto,
} from './dto/store.dto';

type ModelConfig = {
  codeField: string;
  nameField: string;
  modelName:
    | 'storeCity'
    | 'storeGu'
    | 'storeDong'
    | 'storeBackarea'
    | 'storeCommercial';
};

@Injectable()
export class StoreService {
  private readonly logger = new Logger(StoreService.name);

  private readonly modelMap: Record<StoreLevel, ModelConfig> = {
    city: {
      codeField: 'mega_cd',
      nameField: 'mega_cd_nm',
      modelName: 'storeCity',
    },
    gu: {
      codeField: 'signgu_cd',
      nameField: 'signgu_cd_nm',
      modelName: 'storeGu',
    },
    dong: {
      codeField: 'adstrd_cd',
      nameField: 'adstrd_cd_nm',
      modelName: 'storeDong',
    },
    backarea: {
      codeField: 'trdar_cd',
      nameField: 'trdar_cd_nm',
      modelName: 'storeBackarea',
    },
    commercial: {
      codeField: 'trdar_cd',
      nameField: 'trdar_cd_nm',
      modelName: 'storeCommercial',
    },
  };

  constructor(
    private readonly prisma: PrismaService,
    private readonly marketRepository: MarketRepository,
  ) {}

  async getStoreStats(query: GetStoreQueryDto): Promise<StoreResponseDto> {
    const { level, code, industryCode, quarter } = query;
    const modelConfig = this.modelMap[level];
    if (!modelConfig) {
      throw new BadRequestException(`지원하지 않는 레벨: ${level}`);
    }

    const client = (this.prisma as any)[modelConfig.modelName];
    if (!client) {
      throw new BadRequestException('Prisma 모델을 찾을 수 없습니다.');
    }

    const resolvedQuarter =
      quarter || (await this.getLatestQuarter(client, modelConfig.modelName));

    const where: Record<string, string> = {
      stdr_yyqu_cd: resolvedQuarter,
      [modelConfig.codeField]: code,
    };
    if (industryCode) {
      where.svc_induty_cd = industryCode;
    }

    const rows = await client.findMany({
      where,
      select: {
        stdr_yyqu_cd: true,
        svc_induty_cd: true,
        svc_induty_cd_nm: true,
        stor_co: true,
        similr_induty_stor_co: true,
        frc_stor_co: true,
        opbiz_rt: true,
        opbiz_stor_co: true,
        clsbiz_rt: true,
        clsbiz_stor_co: true,
      },
    });

    return {
      level,
      code,
      quarter: resolvedQuarter,
      items: rows.map((row: any) => ({
        industryCode: row.svc_induty_cd,
        industryName: row.svc_induty_cd_nm,
        storeCount: Number(row.stor_co || 0),
        similarStoreCount: Number(row.similr_induty_stor_co || 0),
        franchiseStoreCount: Number(row.frc_stor_co || 0),
        openRate: Number(row.opbiz_rt || 0),
        openStoreCount: Number(row.opbiz_stor_co || 0),
        closeRate: Number(row.clsbiz_rt || 0),
        closeStoreCount: Number(row.clsbiz_stor_co || 0),
      })),
    };
  }

  /**
   * 업종 코드로 점포 위치 조회
   * @param query 업종 코드 및 bbox 필터
   * @returns 점포 위치 목록
   */
  async getStoreLocations(
    query: GetStoreLocationsQueryDto,
  ): Promise<StoreLocationsResponseDto> {
    const {
      industryCode,
      minLng,
      maxLng,
      minLat,
      maxLat,
      limit,
      areaCode,
      level,
    } = query;

    let stores: { lng: number; lat: number; name: string; address: string }[] =
      [];

    // 1. 지역 코드가 있으면 Polygon 검색 우선
    if (areaCode && level) {
      stores = await this.marketRepository.findStoresByIndustryAndArea({
        industryCode,
        areaCode,
        level,
        limit: limit || 1000,
      });
    } else {
      // 2. bbox가 있으면 사용
      const bbox =
        minLng !== undefined &&
        maxLng !== undefined &&
        minLat !== undefined &&
        maxLat !== undefined
          ? { minLng, maxLng, minLat, maxLat }
          : undefined;

      stores = await this.marketRepository.findStoresByIndustryCode({
        industryCode,
        bbox,
        limit: limit || 100,
      });
    }

    return {
      industryCode,
      count: stores.length,
      stores,
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
      throw new BadRequestException('점포 데이터가 없습니다.');
    }

    return latest.stdr_yyqu_cd as string;
  }
}
