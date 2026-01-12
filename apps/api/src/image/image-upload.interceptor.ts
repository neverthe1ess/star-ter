import { BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';

export const imageFileInterceptor = FileInterceptor('file', {
  storage: memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
  fileFilter: (req, file, callback) => {
    if (!file.mimetype.match(/\/(jpg|jpeg|png|gif|webp)$/)) {
      return callback(
        new BadRequestException('이미지 파일만 업로드 가능합니다.'),
        false,
      );
    }
    callback(null, true);
  },
});
