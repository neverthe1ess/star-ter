import {
  Controller,
  Post,
  Body,
  Res,
  Logger,
  UseGuards,
  Get,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { User } from './decorators/user.decorator';
import type { Response } from 'express';
import type { AuthenticatedUser } from './types/authenticatedUser';
import { LocalAuthGuard } from './guard/local-auth.guard';
import { JwtAuthGuard } from './guard/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);
  constructor(private readonly authService: AuthService) {}

  // 회원가입
  @Post('register')
  register(@Body() registerDto: RegisterDto) {
    this.logger.log(`Registering user with email: ${registerDto.email}`);
    return this.authService.register(
      registerDto.email,
      registerDto.nickname,
      registerDto.password,
    );
  }

  // 로그인
  @Post('login')
  @UseGuards(LocalAuthGuard)
  login(@Res() res: Response, @User() user: AuthenticatedUser) {
    this.logger.log(`Logging in user with id: ${user.id}`);
    const { access_token } = this.authService.getJwtToken(user);
    res.cookie('access_token', access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax' as const,
      maxAge: 1000 * 60 * 60 * 8, // 8hours
    });
    return res.status(200).json({
      id: user.id,
      nickname: user.nickname,
      on_boarding_completed: user.on_boarding_completed,
    });
  }

  @Post('logout')
  logout(@Res() res: Response) {
    this.logger.log(`Logging out user`);
    res.clearCookie('access_token');
    return res.sendStatus(200);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  me(@User() user: AuthenticatedUser) {
    return {
      id: user.id,
      nickname: user.nickname,
      on_boarding_completed: user.on_boarding_completed,
    };
  }
}
