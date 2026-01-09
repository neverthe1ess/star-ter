import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { RealEstateBookmarkService } from './real_estate_bookmark.service';
import { CreateRealEstateBookmarkDto } from './dto/create-real-estate-bookmark.dto';
import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard';
import { User } from 'src/auth/decorators/user.decorator';
import type { AuthenticatedUser } from 'src/auth/types/authenticatedUser';

@Controller('real-estate-bookmark')
@UseGuards(JwtAuthGuard)
export class RealEstateBookmarkController {
  constructor(
    private readonly realEstateBookmarkService: RealEstateBookmarkService,
  ) {}

  @Post()
  async addBookmark(
    @User() user: AuthenticatedUser,
    @Body() dto: CreateRealEstateBookmarkDto,
  ) {
    return this.realEstateBookmarkService.addBookmark(user.id, dto);
  }

  @Delete(':id')
  async removeBookmark(
    @User() user: AuthenticatedUser,
    @Param('id') realEstateId: string,
  ) {
    return this.realEstateBookmarkService.removeBookmark(user.id, realEstateId);
  }

  @Get()
  async getBookmarks(@User() user: AuthenticatedUser) {
    return this.realEstateBookmarkService.getBookmarks(user.id);
  }

  @Get('check/:id')
  async isBookmarked(
    @User() user: AuthenticatedUser,
    @Param('id') realEstateId: string,
  ) {
    const isBookmarked = await this.realEstateBookmarkService.isBookmarked(
      user.id,
      realEstateId,
    );
    return { isBookmarked };
  }
}
