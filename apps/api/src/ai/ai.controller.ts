import { Controller, Get, Logger, Query, Post, Body } from '@nestjs/common';
import { AiService } from './ai.service';

@Controller('ai')
export class AiController {
  private readonly logger = new Logger(AiController.name);
  constructor(private readonly aiService: AiService) {}

  @Get('/message')
  async chatAI(@Query('message') message: string) {
    const startTime = Date.now();
    this.logger.log(`Received message: ${message}`);
    const response = await this.aiService.getAIMessage(message);
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
}
