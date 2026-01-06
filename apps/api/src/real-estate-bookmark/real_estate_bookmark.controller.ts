import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
  Req,
} from '@nestjs/common';
import { RealEstateBookmarkService } from './real_estate_bookmark.service';
import { CreateRealEstateBookmarkDto } from './dto/create-real-estate-bookmark.dto';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';

interface RequestWithUser extends Request {
  user: {
    userId: string;
  };
}

@Controller('real-estate-bookmark')
@UseGuards(AuthGuard('jwt'))
export class RealEstateBookmarkController {
  constructor(
    private readonly realEstateBookmarkService: RealEstateBookmarkService,
  ) {}

  @Post()
  async addBookmark(
    @Req() req: RequestWithUser,
    @Body() dto: CreateRealEstateBookmarkDto,
  ) {
    return this.realEstateBookmarkService.addBookmark(req.user.userId, dto);
  }

  @Delete(':id')
  async removeBookmark(
    @Req() req: RequestWithUser,
    @Param('id') realEstateId: string,
  ) {
    return this.realEstateBookmarkService.removeBookmark(
      req.user.userId,
      realEstateId,
    );
  }

  @Get()
  async getBookmarks(@Req() req: RequestWithUser) {
    return this.realEstateBookmarkService.getBookmarks(req.user.userId);
  }

  @Get('check/:id')
  async isBookmarked(
    @Req() req: RequestWithUser,
    @Param('id') realEstateId: string,
  ) {
    const isBookmarked = await this.realEstateBookmarkService.isBookmarked(
      req.user.userId,
      realEstateId,
    );
    return { isBookmarked };
  }
}
