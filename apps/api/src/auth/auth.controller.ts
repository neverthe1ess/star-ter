import { Controller, Post, Body, Res, Logger } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { User } from './decorators/user.decorator';
import type { Response } from 'express';
import type { AuthenticatedUser } from './types/authenticatedUser';

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
  login(@Res() res: Response, @User() user: AuthenticatedUser) {
    this.logger.log(`Logging in user with id: ${user.id}`);
    const { access_token } = this.authService.getJwtToken(user);
    res.cookie('access_token', access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax' as const,
      maxAge: 1000 * 60 * 60 * 8, // 8hours
    });
    return res.status(200).json({ ok: true });
  }

  @Post('logout')
  logout(@Res() res: Response) {
    this.logger.log(`Logging out user`);
    res.clearCookie('access_token');
    return;
  }
}
