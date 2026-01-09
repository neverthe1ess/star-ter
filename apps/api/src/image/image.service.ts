import { Injectable } from '@nestjs/common';
import {
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { randomUUID } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';

interface MulterFile {
  originalname: string;
  buffer: Buffer;
  mimetype: string;
}

@Injectable()
export class ImageService {
  private s3Client: S3Client;
  private bucketName: string;

  constructor(private readonly prisma: PrismaService) {
    this.s3Client = new S3Client({
      region: process.env.AWS_REGION || 'ap-northeast-2',
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
      },
    });
    this.bucketName =
      process.env.AWS_S3_BUCKET || 'star-ter-real-estate-images';
  }

  async uploadImage(userId: string, file: MulterFile) {
    // 고유 파일명 생성 (충돌 방지)
    const fileExtension = file.originalname.split('.').pop() || 'jpg';
    const uniqueFileName = `${randomUUID()}.${fileExtension}`;
    const key = `images/${uniqueFileName}`;

    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
    });

    await this.s3Client.send(command);
    await this.prisma.imageInfo.create({
      data: {
        s3_key: key,
        user_id: userId,
      },
    });

    return key;
  }

  async getImage(key: string) {
    const command = new GetObjectCommand({
      Bucket: this.bucketName,
      Key: key,
    });

    const result = await this.s3Client.send(command);

    return {
      body: result.Body,
      contentType: result.ContentType,
      contentLength: result.ContentLength,
    };
  }
}
