export interface AiAction {
  type: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  payload: any;
}

export interface AiResponse {
  reply: string;
  actions?: AiAction[];
}

// 타입 정의만 남기고 API 호출 함수 제거
// Server Actions (app/actions/chat.ts) 사용으로 전환됨
