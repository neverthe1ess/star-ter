import {
  Controller,
  UseGuards,
  Patch,
  Get,
  Body,
  HttpCode,
  Logger,
} from '@nestjs/common';
import { UsersService } from './user.service';
import { User } from 'src/auth/decorators/user.decorator';
import type { AuthenticatedUser } from 'src/auth/types/authenticatedUser';
import { UpdateOnboardingDto } from './dto/update-onboarding.dto';
import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard';

@Controller('users')
export class UsersController {
  private readonly logger = new Logger(UsersController.name);
  constructor(private readonly usersService: UsersService) {}

  @Get('onboarding')
  @UseGuards(JwtAuthGuard)
  async getOnboarding(@User() user: AuthenticatedUser) {
    this.logger.log(`Getting onboarding for user ID: ${user.id}`);
    return await this.usersService.getOnboarding(user.id);
  }

  @Patch('onboarding')
  @UseGuards(JwtAuthGuard)
  @HttpCode(204)
  async updateOnboarding(
    @User() user: AuthenticatedUser,
    @Body() dto: UpdateOnboardingDto,
  ) {
    this.logger.log(`Updating onboarding for user ID: ${user.id}`);
    await this.usersService.updateOnboarding(user.id, dto);
  }
}
