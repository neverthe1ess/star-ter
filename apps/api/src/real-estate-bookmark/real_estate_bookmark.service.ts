import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRealEstateBookmarkDto } from './dto/create-real-estate-bookmark.dto';

// BigInt를 String으로 변환하는 헬퍼 함수
function serializeBigInt(obj: unknown): unknown {
  if (obj === null || obj === undefined) return obj;
  if (typeof obj === 'bigint') return obj.toString();
  if (Array.isArray(obj)) return obj.map(serializeBigInt);
  if (typeof obj === 'object') {
    const result: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj)) {
      result[key] = serializeBigInt(value);
    }
    return result;
  }
  return obj;
}

@Injectable()
export class RealEstateBookmarkService {
  constructor(private readonly prisma: PrismaService) {}

  async addBookmark(userId: string, dto: CreateRealEstateBookmarkDto) {
    const { realEstateId } = dto;

    console.log('[RealEstateBookmark] addBookmark called:', {
      userId,
      realEstateId,
    });

    // 매물 존재 확인
    const realEstate = await this.prisma.real_estate_info.findUnique({
      where: { id: realEstateId },
    });

    console.log('[RealEstateBookmark] realEstate found:', !!realEstate);

    if (!realEstate) {
      throw new NotFoundException('해당 매물을 찾을 수 없습니다.');
    }

    // 이미 즐겨찾기 여부 확인
    const existing = await this.prisma.real_estate_bookmark.findUnique({
      where: {
        user_id_real_estate_id: {
          user_id: userId,
          real_estate_id: realEstateId,
        },
      },
    });

    console.log('[RealEstateBookmark] existing bookmark:', !!existing);

    if (existing) {
      throw new ConflictException('이미 즐겨찾기된 매물입니다.');
    }

    const result = await this.prisma.real_estate_bookmark.create({
      data: {
        user_id: userId,
        real_estate_id: realEstateId,
      },
      include: {
        real_estate_info: true,
      },
    });

    console.log('[RealEstateBookmark] bookmark created successfully');

    // BigInt 직렬화 문제 해결
    return serializeBigInt(result);
  }

  async removeBookmark(userId: string, realEstateId: string) {
    const existing = await this.prisma.real_estate_bookmark.findUnique({
      where: {
        user_id_real_estate_id: {
          user_id: userId,
          real_estate_id: realEstateId,
        },
      },
    });

    if (!existing) {
      throw new NotFoundException('즐겨찾기를 찾을 수 없습니다.');
    }

    return this.prisma.real_estate_bookmark.delete({
      where: {
        user_id_real_estate_id: {
          user_id: userId,
          real_estate_id: realEstateId,
        },
      },
    });
  }

  async getBookmarks(userId: string) {
    const result = await this.prisma.real_estate_bookmark.findMany({
      where: {
        user_id: userId,
      },
      include: {
        real_estate_info: true,
      },
      orderBy: {
        created_at: 'desc',
      },
    });
    return serializeBigInt(result);
  }

  async isBookmarked(userId: string, realEstateId: string) {
    const bookmark = await this.prisma.real_estate_bookmark.findUnique({
      where: {
        user_id_real_estate_id: {
          user_id: userId,
          real_estate_id: realEstateId,
        },
      },
    });
    return !!bookmark;
  }
}
