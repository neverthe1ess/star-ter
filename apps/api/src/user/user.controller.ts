import { Controller, Get, UseGuards, NotFoundException } from '@nestjs/common';
import { UserInfoDto } from './dto/userinfo.dto';
import { AuthGuard } from '@nestjs/passport';
import { UsersService } from './user.service';
import { User } from 'src/auth/decorators/user.decorator';
import type { AuthenticatedUser } from 'src/auth/types/authenticatedUser';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('me')
  async getProfile(@User() user: AuthenticatedUser): Promise<UserInfoDto> {
    const userData = await this.usersService.findOne(user.id);

    if (!userData) {
      throw new NotFoundException('User not found');
    }

    return userData;
  }
}
