import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateOnboardingDto } from './dto/update-onboarding.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ImageService } from '../image/image.service';

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    private imageService: ImageService,
  ) {}

  async getOnboarding(userId: string) {
    const user = await this.prisma.user_info.findUnique({
      where: { id: userId },
      select: {
        target_age_group: true,
        preferred_region: true,
        preferred_business_hours: true,
        startup_capital: true,
        preferred_industry: true,
        on_boarding_completed: true,
      },
    });

    if (!user) {
      return null;
    }

    return {
      age: user.target_age_group,
      region: user.preferred_region,
      operatingTime: user.preferred_business_hours,
      capital: user.startup_capital,
      industryCode: user.preferred_industry,
      completed: user.on_boarding_completed,
    };
  }

  async updateOnboarding(userId: string, dto: UpdateOnboardingDto) {
    await this.prisma.user_info.update({
      where: { id: userId },
      data: {
        target_age_group: dto.age,
        preferred_region: dto.region,
        preferred_business_hours: dto.operatingTime,
        startup_capital: dto.capital,
        preferred_industry: dto.industryCode,
        on_boarding_completed: true,
      },
    });

    return true;
  }

  async getPersonalization(userId: string) {
    const user = await this.prisma.user_info.findUnique({
      where: { id: userId },
      select: {
        target_age_group: true,
        preferred_region: true,
        preferred_business_hours: true,
        startup_capital: true,
        preferred_industry: true,
      },
    });

    return {
      age: user?.target_age_group ?? '',
      region: user?.preferred_region ?? '',
      operatingTime: user?.preferred_business_hours ?? '',
      capital: user?.startup_capital ?? '',
      industryCode: user?.preferred_industry ?? null,
    };
  }

  async updateProfile(
    userId: string,
    dto: UpdateProfileDto,
    file?: Express.Multer.File,
  ) {
    let profileImageId: string | null = null;
    let profileImageKey: string | null = null;

    if (file) {
      const currentProfile = await this.prisma.user_info.findUnique({
        where: { id: userId },
        select: { profile_image_id: true },
      });

      if (currentProfile?.profile_image_id) {
        await this.prisma.imageInfo.update({
          where: { id: currentProfile.profile_image_id },
          data: { is_deleted: true },
        });
      }

      const uploaded = await this.imageService.uploadImage(userId, file);
      profileImageId = uploaded.id;
      profileImageKey = uploaded.key;
    }

    const user = await this.prisma.user_info.update({
      where: { id: userId },
      data: {
        ...(dto.nickname ? { nickname: dto.nickname } : {}),
        ...(profileImageId ? { profile_image_id: profileImageId } : {}),
      },
      select: {
        nickname: true,
        profile_image: {
          select: { s3_key: true, is_deleted: true },
        },
      },
    });

    const nextProfileKey =
      profileImageKey ??
      (user.profile_image && !user.profile_image.is_deleted
        ? user.profile_image.s3_key
        : null);

    return {
      nickname: user.nickname,
      profile_image_key: nextProfileKey,
    };
  }

  async getLatestProfileImageKey(userId: string) {
    const user = await this.prisma.user_info.findUnique({
      where: { id: userId },
      select: {
        profile_image: {
          select: { s3_key: true, is_deleted: true },
        },
      },
    });

    if (!user?.profile_image || user.profile_image.is_deleted) {
      return null;
    }

    return user.profile_image.s3_key;
  }

  async getProfileForAuth(userId: string) {
    const user = await this.prisma.user_info.findUnique({
      where: { id: userId },
      select: {
        nickname: true,
        on_boarding_completed: true,
        profile_image: {
          select: { s3_key: true, is_deleted: true },
        },
      },
    });

    let profileImageKey: string | null = null;
    if (user?.profile_image && !user.profile_image.is_deleted) {
      profileImageKey = user.profile_image.s3_key;
    }

    return {
      nickname: user?.nickname,
      on_boarding_completed: user?.on_boarding_completed,
      profile_image_key: profileImageKey,
    };
  }
}
