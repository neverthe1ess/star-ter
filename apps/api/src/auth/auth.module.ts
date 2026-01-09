import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './guard/strategy/jwt.strategy';
import { LocalStrategy } from './guard/strategy/local.strategy';
import { AuthRepository } from './auth.repository';

@Module({
  imports: [
    PassportModule,
    JwtModule.register({
      secret: 'secretKey',
      signOptions: { expiresIn: '8h' }, // 토큰 유효시간 8시간
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, AuthRepository, JwtStrategy, LocalStrategy],
  exports: [AuthService],
})
export class AuthModule {}
