'use server';

import { type AiResponse } from '@/lib/api/ai';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000';

// AI 프로바이더 타입
type AiProvider = 'claude' | 'openai';

// Server Action 함수
// 클라이언트에서 await sendMessage(...) 형태로 호출 가능
export async function sendMessage(
  message: string,
  history: Array<{ role: 'user' | 'assistant'; content: string }>,
  userId?: string, // 로그인된 사용자 ID (개인화 추천에 사용)
  aiProvider: AiProvider = 'claude', // 런타임에 프로바이더 선택
): Promise<AiResponse> {
  // 프로바이더에 따른 API 엔드포인트 결정
  const endpoint =
    aiProvider === 'claude' ? '/assistant/message' : '/ai/message';

  console.log(`[Server Action] Sending message to ${aiProvider}:`, message);

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message,
        history,
        userId, // 개인화 추천을 위한 사용자 ID
      }),
      // 캐싱 방지 (항상 새로운 응답 필요)
      cache: 'no-store',
    });

    if (!response.ok) {
      console.error(
        '[Server Action] API Error:',
        response.status,
        response.statusText,
      );
      throw new Error(`AI API responded with status: ${response.status}`);
    }

    const text = await response.text();
    console.log('[Server Action] Received response length:', text.length);

    try {
      // 1. JSON 파싱 시도 (Structured Output)
      const parsed = JSON.parse(text);
      if (parsed.reply || parsed.actions) {
        return {
          reply: parsed.reply || '',
          actions: parsed.actions || [],
        };
      }

      // JSON이지만 reply/actions 필드가 없는 경우 (예: 에러 객체 등)
      // 일반 텍스트로 취급하거나 내용을 확인해야 함.
      // 여기서는 텍스트 전체를 reply로 사용
      return { reply: text };
    } catch {
      // 2. JSON 파싱 실패 -> 일반 텍스트 응답
      return { reply: text };
    }
  } catch (error) {
    console.error('[Server Action] Failed:', error);
    // 에러를 클라이언트로 전파하거나, 기본 에러 메시지 반환
    throw new Error('AI 서비스를 연결할 수 없습니다.');
  }
}
