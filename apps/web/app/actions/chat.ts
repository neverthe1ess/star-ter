'use server';

import { cookies } from 'next/headers';
import { type AiChatResponse } from '@/lib/api/ai';
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000';

// Server Action 함수
// 클라이언트에서 await sendMessage(...) 형태로 호출 가능
export async function sendMessage(
  message: string,
  conversationId?: string,
): Promise<AiChatResponse> {
  console.log('[Server Action] Sending message to chat:', message);

  try {
    const cookieStore = await cookies();
    const cookieHeader = cookieStore
      .getAll()
      .map((cookie) => `${cookie.name}=${cookie.value}`)
      .join('; ');
    const response = await fetch(`${API_BASE_URL}/chat/send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(cookieHeader ? { Cookie: cookieHeader } : {}),
      },
      body: JSON.stringify({
        message,
        conversationId,
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

    const result = await response.json();
    return {
      reply: result.reply || '',
      actions: result.actions || [],
    };
  } catch (error) {
    console.error('[Server Action] Failed:', error);
    // 에러를 클라이언트로 전파하거나, 기본 에러 메시지 반환
    throw new Error('AI 서비스를 연결할 수 없습니다.');
  }
}
