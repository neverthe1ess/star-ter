import { Module } from '@nestjs/common';
import { RealEstateBookmarkController } from './real_estate_bookmark.controller';
import { RealEstateBookmarkService } from './real_estate_bookmark.service';

@Module({
  controllers: [RealEstateBookmarkController],
  providers: [RealEstateBookmarkService],
})
export class RealEstateBookmarkModule {}
