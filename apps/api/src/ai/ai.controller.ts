import { Controller, Logger, Post, Body } from '@nestjs/common';
import { AiService } from './ai.service';

@Controller('ai')
export class AiController {
  private readonly logger = new Logger(AiController.name);
  constructor(private readonly aiService: AiService) {}

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
}
