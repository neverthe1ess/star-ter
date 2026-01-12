import { Module } from '@nestjs/common';
import { AnalysisService } from './analysis.service';
import { AnalysisController } from './analysis.controller';
import { AnalysisRepository } from './analysis.repository';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { UsersModule } from '../user/user.module';

@Module({
  imports: [PrismaModule, AuthModule, UsersModule],
  controllers: [AnalysisController],
  providers: [AnalysisService, AnalysisRepository],
})
export class AnalysisModule {}
