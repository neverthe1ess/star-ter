import { Module } from '@nestjs/common';
import { RealEstateController } from './real-estate.controller';
import { RealEstateService } from './real-estate.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [RealEstateController],
  providers: [RealEstateService],
})
export class RealEstateModule {}
