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
    const where = this.buildBBoxFilter(query);

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

    return results.map((item) => this.toResponseDto(item));
  }

  private buildBBoxFilter(
    query: GetRealEstateQueryDto,
  ): Prisma.real_estate_infoWhereInput {
    const { minx, miny, maxx, maxy } = query;

    if (!minx || !miny || !maxx || !maxy) return {};

    return {
      centerlatitude: { gte: miny, lte: maxy },
      centerlongitude: { gte: minx, lte: maxx },
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
