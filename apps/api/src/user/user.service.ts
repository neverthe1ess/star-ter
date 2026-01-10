import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateOnboardingDto } from './dto/update-onboarding.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async getOnboarding(userId: string) {
    const user = await this.prisma.user_info.findUnique({
      where: { id: userId },
      select: {
        target_age_group: true,
        preferred_region: true,
        preferred_business_hours: true,
        startup_capital: true,
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
        on_boarding_completed: true,
      },
    });

    return true;
  }
}
