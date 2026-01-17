/**
 * Assistant Module - Claude 기반 채팅 NestJS 모듈
 */
import { Module } from '@nestjs/common';
import { AssistantController } from './assistant.controller';
import { AssistantService } from './assistant.service';
import { AiModule } from '../ai/ai.module';

@Module({
  imports: [AiModule],
  controllers: [AssistantController],
  providers: [AssistantService],
  exports: [AssistantService],
})
export class AssistantModule {
  constructor() {
    console.log('[AssistantModule] Claude Assistant Module loaded');
  }
}
