import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

export interface CommercialRentData {
  trdar_cd: string;
  trdar_cd_n: string;
  avg_deposit: number | null;
  avg_rent: number | null;
  avg_premium: number | null;
  building_count: number;
}

@Injectable()
export class RentRepository {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * 모든 상권의 평균 임대료 데이터 조회
   * process_real_estate 테이블에서 전처리된 데이터 직접 조회
   */
  async getAllCommercialRents(): Promise<CommercialRentData[]> {
    const result = await this.prisma.$queryRaw<CommercialRentData[]>`
      SELECT 
        trdar_cd,
        trdar_cd_n,
        avg_deposit::float AS avg_deposit,
        avg_rent::float AS avg_rent,
        avg_premium::float AS avg_premium,
        building_count::int AS building_count
      FROM process_real_estate
      WHERE avg_deposit IS NOT NULL
        AND avg_rent IS NOT NULL;
    `;

    return result;
  }
}
