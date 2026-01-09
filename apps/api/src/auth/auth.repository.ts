import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class AuthRepository {
  constructor(private prisma: PrismaService) {}

  async findOneByEmail(email: string) {
    return this.prisma.user_info.findUnique({ where: { email } });
  }

  async createUser(email: string, nickname: string, hash: string) {
    return this.prisma.user_info.create({
      data: {
        email,
        nickname,
        password: hash,
      },
    });
  }
}
