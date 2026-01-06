import { Module } from '@nestjs/common';
import { RealEstateController } from './real_estate.controller';
import { RealEstateService } from './real_estate.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [RealEstateController],
  providers: [RealEstateService],
})
export class RealEstateModule {}
