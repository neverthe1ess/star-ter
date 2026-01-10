import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface NewsItem {
  title: string;
  originallink: string;
  link: string;
  description: string;
  pubDate: string;
}

export interface NaverNewsResponse {
  lastBuildDate: string;
  total: number;
  start: number;
  display: number;
  items: NewsItem[];
}

@Injectable()
export class NewsService {
  constructor(private configService: ConfigService) {}

  async getNews(region: string): Promise<NaverNewsResponse> {
    const clientId = this.configService.get<string>('NAVER_CLIENT_ID');
    const clientSecret = this.configService.get<string>('NAVER_CLIENT_SECRET');

    if (!clientId || !clientSecret) {
      throw new InternalServerErrorException(
        'Naver API credentials not configured',
      );
    }

    // 키워드는 야기서 수정 하도록 하자
    const query = `"${region}" 상권 소상공인`;

    const url = `https://openapi.naver.com/v1/search/news.json?query=${encodeURIComponent(
      query,
    )}&display=5&sort=sim`;

    try {
      const response = await fetch(url, {
        headers: {
          'X-Naver-Client-Id': clientId,
          'X-Naver-Client-Secret': clientSecret,
        },
      });

      if (!response.ok) {
        throw new InternalServerErrorException(
          `Naver API error: ${response.statusText}`,
        );
      }

      const data = (await response.json()) as NaverNewsResponse;
      return data;
    } catch (error) {
      console.error('Error fetching Naver news:', error);
      throw new InternalServerErrorException('Failed to fetch news');
    }
  }
}
