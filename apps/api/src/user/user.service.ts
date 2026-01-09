import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateOnboardingDto } from './dto/update-onboarding.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

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
