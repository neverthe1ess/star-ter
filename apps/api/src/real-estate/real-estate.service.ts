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

  async create(data: CreateRealEstateDto) {
    const toBigInt = (val?: number) => (val ? BigInt(val) : null);

    return this.prisma.real_estate_register.create({
      data: {
        ...data,
        id: randomUUID(),
        deposit: toBigInt(data.deposit),
        monthly_rent: toBigInt(data.monthly_rent),
        maintenance_fee: toBigInt(data.maintenance_fee),
        premium: toBigInt(data.premium),
        price_per_pyeong: toBigInt(data.price_per_pyeong),
      },
    });
  }

  async getRealEstateInfo(
    query: GetRealEstateQueryDto,
  ): Promise<RealEstateResponseDto[]> {
    const where = this.buildBBoxFilter(query);

    const results = await this.prisma.real_estate_register.findMany({
      where,
      select: {
        id: true,
        address_name: true,
        address_road_name: true,
        address_x: true,
        address_y: true,
        deposit: true,
        monthly_rent: true,
        premium: true,
        floor_info: true,
      },
    });

    return results.map((item) => this.toResponseDto(item));
  }

  private buildBBoxFilter(
    query: GetRealEstateQueryDto,
  ): Prisma.real_estate_registerWhereInput {
    const { minx, miny, maxx, maxy } = query;

    if (!minx || !miny || !maxx || !maxy) return {};

    return {
      address_x: { gte: miny, lte: maxy }, // Lat (위도)
      address_y: { gte: minx, lte: maxx }, // Lng (경도)
    };
  }

  private toResponseDto(item: {
    id: string;
    address_name: string | null;
    address_road_name: string | null;
    address_x: { toNumber(): number } | null;
    address_y: { toNumber(): number } | null;
    deposit: bigint | null;
    monthly_rent: bigint | null;
    premium: bigint | null;
    floor_info: string | null;
  }): RealEstateResponseDto {
    return {
      id: item.id,
      address_name: item.address_name,
      address_road_name: item.address_road_name,
      address_x: item.address_x?.toNumber() ?? null,
      address_y: item.address_y?.toNumber() ?? null,
      deposit: item.deposit ? Number(item.deposit) : null,
      monthly_rent: item.monthly_rent ? Number(item.monthly_rent) : null,
      premium: item.premium ? Number(item.premium) : null,
      floor_info: item.floor_info,
    };
  }
}
