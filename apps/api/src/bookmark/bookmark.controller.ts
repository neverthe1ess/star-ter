import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { BookmarkService } from './bookmark.service';
import { CreateBookmarkDto } from './dto/create-bookmark.dto';
import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard';
import { User } from 'src/auth/decorators/user.decorator';
import type { AuthenticatedUser } from 'src/auth/types/authenticatedUser';

@Controller('bookmark')
@UseGuards(JwtAuthGuard)
export class BookmarkController {
  constructor(private readonly bookmarkService: BookmarkService) {}

  @Post()
  async addBookmark(
    @User() user: AuthenticatedUser,
    @Body() createBookmarkDto: CreateBookmarkDto,
  ) {
    return this.bookmarkService.addBookmark(user.id, createBookmarkDto);
  }

  @Delete(':code')
  async removeBookmark(
    @User() user: AuthenticatedUser,
    @Param('code') commercialCode: string,
  ) {
    return this.bookmarkService.removeBookmark(user.id, commercialCode);
  }

  @Get()
  async getBookmarks(@User() user: AuthenticatedUser) {
    return this.bookmarkService.getBookmarks(user.id);
  }
}
