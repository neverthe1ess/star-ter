import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  Get,
  Param,
  Res,
  NotFoundException,
  UseGuards,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import type { Response } from 'express';
import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard';
import { User } from 'src/auth/decorators/user.decorator';
import type { AuthenticatedUser } from 'src/auth/types/authenticatedUser';
import { ImageService } from './image.service';

@Controller('image')
export class ImageController {
  constructor(private readonly imageService: ImageService) {}

  @Get(':key')
  async getImage(@Param('key') key: string, @Res() res: Response) {
    if (!key) {
      throw new BadRequestException('key 파라미터가 필요합니다.');
    }

    try {
      const result = await this.imageService.getImage(decodeURIComponent(key));
      if (!result.body) {
        throw new NotFoundException('이미지를 찾을 수 없습니다.');
      }

      if (result.contentType) res.setHeader('Content-Type', result.contentType);
      if (result.contentLength)
        res.setHeader('Content-Length', result.contentLength.toString());
      res.setHeader('Cache-Control', 'public, max-age=3600');

      (result.body as NodeJS.ReadableStream).pipe(res);
    } catch (error) {
      if ((error as { name?: string }).name === 'NoSuchKey') {
        throw new NotFoundException('이미지를 찾을 수 없습니다.');
      }
      throw error;
    }
  }
}
