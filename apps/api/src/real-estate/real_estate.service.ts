import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '../../generated/prisma/client';
import { randomUUID } from 'crypto';

import { CreateRealEstateDto } from './dto/real-estate-create.dto';
import { GetRealEstateQueryDto } from './dto/real-estate-get.dto';
import { RealEstateResponseDto } from './dto/real-estate-response.dto';

@Injectable()
export class RealEstateService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateRealEstateDto): Promise<RealEstateResponseDto> {
    const toBigInt = (val?: number) => (val ? BigInt(val) : null);

    if (!data.user_id) {
      throw new Error('User ID is required');
    }

    const result = await this.prisma.real_estate_info.create({
      data: {
        id: randomUUID(),
        user_id: data.user_id,
        name: data.name ?? null,
        address: data.address ?? null,
        roadaddress: data.roadaddress ?? null,
        centerlatitude: data.centerlatitude
          ? new Prisma.Decimal(data.centerlatitude)
          : null,
        centerlongitude: data.centerlongitude
          ? new Prisma.Decimal(data.centerlongitude)
          : null,
        title: data.title ?? null,
        deposit: toBigInt(data.deposit),
        monthlyrent: toBigInt(data.monthlyrent),
        maintenancefee: toBigInt(data.maintenancefee),
        premium: toBigInt(data.premium),
        // areaprice 자동 계산: (월세 + 관리비) / 면적(평)
        // size는 m² 단위이므로 평으로 변환 (÷ 3.3058)
        areaprice:
          data.monthlyrent && data.size
            ? toBigInt(
                Math.round(
                  ((data.monthlyrent || 0) + (data.maintenancefee || 0)) /
                    (data.size / 3.3058),
                ),
              )
            : null,
        size: data.size ? new Prisma.Decimal(data.size) : null,
        floor: data.floor ?? null,
        groundfloor: data.groundfloor ?? null,
        businesslargecodename: data.businesslargecodename ?? null,
        businessmiddlecodename: data.businessmiddlecodename ?? null,
        nearsubwaystation: data.nearsubwaystation ?? null,
        ismoveindate: data.ismoveindate ?? null,
        previewphotourl: data.previewphotourl ?? null,
        createddateutc: new Date(),
        moveindate: data.moveindate ? new Date(data.moveindate) : null,
      },
    });

    return this.toResponseDto(result);
  }

  async getRealEstateInfo(
    query: GetRealEstateQueryDto,
  ): Promise<RealEstateResponseDto[]> {
    console.log('[RealEstateService] 🔍 getRealEstateInfo 시작');
    console.log(
      '[RealEstateService] 📥 쿼리 파라미터:',
      JSON.stringify(query, null, 2),
    );

    const where = this.buildBBoxFilter(query);
    console.log(
      '[RealEstateService] 🔧 WHERE 조건:',
      JSON.stringify(
        where,
        (key, value) => (typeof value === 'bigint' ? value.toString() : value),
        2,
      ),
    );

    const results = await this.prisma.real_estate_info.findMany({
      where,
      select: {
        id: true,
        name: true,
        address: true,
        roadaddress: true,
        centerlatitude: true,
        centerlongitude: true,
        title: true,
        deposit: true,
        monthlyrent: true,
        maintenancefee: true,
        premium: true,
        areaprice: true,
        size: true,
        floor: true,
        groundfloor: true,
        businesslargecodename: true,
        businessmiddlecodename: true,
        nearsubwaystation: true,
        ismoveindate: true,
        previewphotourl: true,
      },
    });

    console.log(`[RealEstateService] ✅ 조회 결과: ${results.length}개 매물`);

    // 샘플 데이터 출력 (첫 3개)
    if (results.length > 0) {
      console.log('[RealEstateService] 📋 샘플 데이터 (첫 3개):');
      results.slice(0, 3).forEach((item, idx) => {
        console.log(`  [${idx + 1}] ${item.title || item.name || 'N/A'}`);
        console.log(
          `      좌표: (${item.centerlatitude?.toString() ?? 'N/A'}, ${item.centerlongitude?.toString() ?? 'N/A'})`,
        );
        console.log(
          `      보증금: ${item.deposit ? item.deposit.toString() : 'N/A'}`,
        );
      });
    }

    return results.map((item) => this.toResponseDto(item));
  }

  async getRealEstateByUser(userId: string): Promise<RealEstateResponseDto[]> {
    const results = await this.prisma.real_estate_info.findMany({
      where: {
        user_id: userId,
      },
      select: {
        id: true,
        name: true,
        address: true,
        roadaddress: true,
        centerlatitude: true,
        centerlongitude: true,
        title: true,
        deposit: true,
        monthlyrent: true,
        maintenancefee: true,
        premium: true,
        areaprice: true,
        size: true,
        floor: true,
        groundfloor: true,
        businesslargecodename: true,
        businessmiddlecodename: true,
        nearsubwaystation: true,
        ismoveindate: true,
        previewphotourl: true,
        createddateutc: true,
      },
      orderBy: {
        createddateutc: 'desc',
      },
    });

    return results.map((item) => this.toResponseDto(item));
  }

  private buildBBoxFilter(
    query: GetRealEstateQueryDto,
  ): Prisma.real_estate_infoWhereInput {
    console.log('[RealEstateService] 🔧 buildBBoxFilter 시작');

    const {
      minx,
      miny,
      maxx,
      maxy,
      maxDeposit,
      maxMonthlyRent,
      minSize,
      keywords,
    } = query;

    const conditions: Prisma.real_estate_infoWhereInput[] = [];

    // BBox 필터 (위치 기반)
    if (minx && miny && maxx && maxy) {
      console.log(`[RealEstateService] 📍 BBox 필터:`);
      console.log(`    경도(lng): ${minx} ~ ${maxx}`);
      console.log(`    위도(lat): ${miny} ~ ${maxy}`);
      conditions.push({
        centerlatitude: { gte: miny, lte: maxy },
        centerlongitude: { gte: minx, lte: maxx },
      });
    } else {
      console.log('[RealEstateService] ⚠️ BBox 필터 없음 (위치 조건 미지정)');
    }

    // 최대 보증금 필터 (AI는 만원 단위로 전달, DB는 천원 단위로 저장)
    // 만원 → 천원 변환: ×10
    if (maxDeposit) {
      const depositInCheonWon = maxDeposit * 10;
      console.log(`[RealEstateService] 💰 보증금 필터:`);
      console.log(
        `    입력: ${maxDeposit}만원 → DB조건: ${depositInCheonWon}천원 이하`,
      );
      conditions.push({
        deposit: { lte: BigInt(depositInCheonWon) },
      });
    }

    // 최대 월세 필터 (AI는 만원 단위로 전달, DB는 천원 단위로 저장)
    if (maxMonthlyRent) {
      const rentInCheonWon = maxMonthlyRent * 10;
      console.log(
        `[RealEstateService] 🏠 월세 필터: ${maxMonthlyRent}만원 → ${rentInCheonWon}천원 이하`,
      );
      conditions.push({
        monthlyrent: { lte: BigInt(rentInCheonWon) },
      });
    }

    // 최소 면적 필터 (m² 단위 → DB는 m² 저장, 프론트는 평 단위로 전달)
    // 평 → m² 변환: 1평 = 3.3058 m²
    if (minSize) {
      const minSizeM2 = minSize * 3.3058;
      console.log(
        `[RealEstateService] 📐 면적 필터: ${minSize}평 → ${minSizeM2.toFixed(2)}m² 이상`,
      );
      conditions.push({
        size: { gte: minSizeM2 },
      });
    }

    // 키워드 필터 (제목, 주소, 업종명에서 검색)
    if (keywords) {
      console.log(`[RealEstateService] 🔍 키워드 필터: "${keywords}"`);
      conditions.push({
        OR: [
          { title: { contains: keywords, mode: 'insensitive' } },
          { address: { contains: keywords, mode: 'insensitive' } },
          {
            businesslargecodename: { contains: keywords, mode: 'insensitive' },
          },
          {
            businessmiddlecodename: { contains: keywords, mode: 'insensitive' },
          },
        ],
      });
    }

    console.log(
      `[RealEstateService] 📊 총 필터 조건 수: ${conditions.length}개`,
    );

    if (conditions.length === 0) {
      console.log('[RealEstateService] ⚠️ 필터 조건 없음! 전체 데이터 조회됨');
      return {};
    }

    return {
      AND: conditions,
    };
  }

  private toResponseDto(item: {
    id: string;
    name: string | null;
    address: string | null;
    roadaddress: string | null;
    centerlatitude: { toNumber(): number } | null;
    centerlongitude: { toNumber(): number } | null;
    title: string | null;
    deposit: bigint | null;
    monthlyrent: bigint | null;
    maintenancefee: bigint | null;
    premium: bigint | null;
    areaprice: bigint | null;
    size: { toNumber(): number } | null;
    floor: number | null;
    groundfloor: number | null;
    businesslargecodename: string | null;
    businessmiddlecodename: string | null;
    nearsubwaystation: string | null;
    ismoveindate: boolean | null;
    previewphotourl: string | null;
  }): RealEstateResponseDto {
    return {
      id: item.id,
      name: item.name,
      address: item.address,
      roadaddress: item.roadaddress,
      centerlatitude: item.centerlatitude?.toNumber() ?? null,
      centerlongitude: item.centerlongitude?.toNumber() ?? null,
      title: item.title,
      deposit: item.deposit ? Number(item.deposit) : null,
      monthlyrent: item.monthlyrent ? Number(item.monthlyrent) : null,
      maintenancefee: item.maintenancefee ? Number(item.maintenancefee) : null,
      premium: item.premium ? Number(item.premium) : null,
      areaprice: item.areaprice ? Number(item.areaprice) : null,
      size: item.size?.toNumber() ?? null,
      floor: item.floor,
      groundfloor: item.groundfloor,
      businesslargecodename: item.businesslargecodename,
      businessmiddlecodename: item.businessmiddlecodename,
      nearsubwaystation: item.nearsubwaystation,
      ismoveindate: item.ismoveindate,
      previewphotourl: item.previewphotourl,
    };
  }
}
