import { Injectable } from '@nestjs/common';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { randomUUID } from 'crypto';

interface MulterFile {
  originalname: string;
  buffer: Buffer;
  mimetype: string;
}

@Injectable()
export class S3Service {
  private s3Client: S3Client;
  private bucketName: string;

  constructor() {
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

  async uploadImage(file: MulterFile): Promise<{ url: string; key: string }> {
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

    // S3 URL 생성
    const url = `https://${this.bucketName}.s3.${process.env.AWS_REGION || 'ap-northeast-2'}.amazonaws.com/${key}`;

    return { url, key };
  }
}
