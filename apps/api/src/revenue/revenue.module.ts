import { Module } from '@nestjs/common';
import { RevenueService } from './revenue.service';
import { RevenueController } from './revenue.controller';
import { RevenueRepository } from './revenue.repository';

@Module({
  providers: [RevenueService, RevenueRepository],
  controllers: [RevenueController],
})
export class RevenueModule {}
