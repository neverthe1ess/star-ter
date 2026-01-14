export interface Source {
  id: string;
  title: string;
  url: string;
  favicon?: string;
  number: number;
}

import { type ChartAction } from './charts';

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  sources?: Source[];
  chartActions?: ChartAction[]; // 차트 액션 (AI 메시지용)
}

export interface Thread {
  id: string;
  title: string;
  createdAt: Date;
}
