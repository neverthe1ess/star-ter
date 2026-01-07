import { Controller, Get, Logger, Query, Post, Body } from '@nestjs/common';
import { AiService } from './ai.service';

@Controller('ai')
export class AiController {
  private readonly logger = new Logger(AiController.name);
  constructor(private readonly aiService: AiService) {}

  // 기존 GET 엔드포인트 (하위 호환성 유지)
  @Get('/message')
  async chatAI(@Query('message') message: string) {
    const startTime = Date.now();
    this.logger.log(`Received message: ${message}`);
    const response = await this.aiService.getAIMessage(message);
    this.logger.log(`Response time: ${Date.now() - startTime} ms`);
    return response;
  }

  // 대화 히스토리 포함 POST 엔드포인트 (꼬리 질문 지원)
  @Post('/message')
  async chatAIWithHistory(
    @Body()
    body: {
      message: string;
      history?: Array<{ role: 'user' | 'assistant'; content: string }>;
    },
  ) {
    const startTime = Date.now();
    this.logger.log(
      `Received message with history: ${body.message} (${body.history?.length || 0} previous messages)`,
    );
    const response = await this.aiService.getAIMessageWithHistory(
      body.message,
      body.history || [],
    );
    this.logger.log(`Response time: ${Date.now() - startTime} ms`);
    return response;
  }

  @Get('/area')
  async getAreaByMessage(@Query('message') message: string) {
    return this.aiService.getAreaByMessage(message);
  }

  @Post('/analyze')
  async analyze(
    @Body('topic') topic: string,
    @Body('areaName') areaName: string,
    @Body('metrics') metrics: string,
  ) {
    return this.aiService.getAnalysis(topic, areaName, metrics);
  }

  @Post('/real-estate-summary')
  async getRealEstateSummary(@Body('metrics') metrics: string) {
    const startTime = Date.now();
    this.logger.log('Received real estate summary request');
    const response = await this.aiService.getRealEstateSummary(metrics);
    this.logger.log(
      `Real estate summary response time: ${Date.now() - startTime} ms`,
    );
    return response;
  }
}
