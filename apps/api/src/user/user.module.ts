import { Module } from '@nestjs/common';
import { UsersController } from './user.controller';
import { UsersService } from './user.service';
import { PrismaModule } from '../prisma/prisma.module';
import { ImageModule } from '../image/image.module';

@Module({
  imports: [PrismaModule, ImageModule],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
