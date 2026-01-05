import { IChatRepository } from './chat.interface';
import { MockChatRepository } from './chat.repository.mock';
import { ApiChatRepository } from './chat.repository.api';

/**
 * ChatService Factory
 * 환경 변수(USE_MOCK_API)에 따라 적절한 Repository 구현체를 반환합니다.
 * 백엔드 연동 시 이 부분의 플래그만 변경하면 됩니다.
 */
function getChatRepository(): IChatRepository {
  // TODO: 추후 .env 파일에서 제어 가능하도록 수정
  // const useMock = process.env.USE_MOCK_API !== 'false';
  const useMock = false; // Real API 모드 활성화

  if (useMock) {
    console.log('[ChatService] Using Mock Repository'); // 개발 모드 확인용 로그
    return new MockChatRepository();
  }

  console.log('[ChatService] Using API Repository');
  return new ApiChatRepository();
}

// 애플리케이션 전역에서 사용할 싱글톤 서비스 인스턴스
export const chatService = getChatRepository();
