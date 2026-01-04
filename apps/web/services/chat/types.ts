import { ClientAction } from '@/types/actions';

export type MessageRole = 'user' | 'assistant' | 'system';

export interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: Date;
  actions?: ClientAction[]; // AI 응답에 포함된 UI 제어 명령
}

export interface ChatResponse {
  messages: ChatMessage[];
}
