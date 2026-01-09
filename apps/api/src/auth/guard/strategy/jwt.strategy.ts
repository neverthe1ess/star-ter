import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { jwtConstants } from 'src/auth/jwt.constants';
import { JwtPayload } from 'src/auth/types/jwt-payload';
import { Request } from 'express';

// eslint-disable-next-line @typescript-eslint/no-unsafe-return
const cookieExtractor = (req: Request) => req?.cookies?.access_token ?? null;

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([cookieExtractor]),
      ignoreExpiration: false,
      secretOrKey: jwtConstants.secret,
    });
  }

  validate(payload: JwtPayload) {
    return { id: payload.sub, nickname: payload.nickname };
  }
}
