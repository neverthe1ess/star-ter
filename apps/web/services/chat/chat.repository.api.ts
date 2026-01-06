import { ChatMessage } from './types';
import { AssistantResponse } from '@/types/actions';

/**
 * ApiChatRepository
 * 실제 백엔드 API (/ai/message)를 호출하여 AI 응답을 받아오는 Repository
 */
export async function sendMessage(
  message: string,
  history: ChatMessage[],
): Promise<ChatMessage> {
  const baseUrl =
    process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000';

  // TODO: 추후 메시지가 길어질 것이니 POST로 전환해야 함.
  const response = await fetch(
    `${baseUrl}/ai/message?message=${encodeURIComponent(message)}`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    },
  );

  if (!response.ok) {
    throw new Error(`API request failed with status ${response.status}`);
  }

  // Parse JSON response (Structured Outputs: { reply, actions })
  const textData = await response.text();
  console.log('[ApiChatRepository] Raw response:', textData);

  let assistantResponse: AssistantResponse;
  try {
    assistantResponse = JSON.parse(textData) as AssistantResponse;
  } catch (parseError) {
    console.error('[ApiChatRepository] JSON parse error:', parseError);
    throw new Error('Failed to parse AI response as JSON');
  }

  // ChatMessage 객체 생성 (actions 필드 포함)
  const chatMessage: ChatMessage = {
    id: Date.now().toString(),
    role: 'assistant',
    content: assistantResponse.reply,
    timestamp: new Date(),
    actions: assistantResponse.actions,
  };

  return chatMessage;
}
