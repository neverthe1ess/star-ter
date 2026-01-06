'use client';

import AssistantLayout from '@/components/assistant/AssistantLayout';

// AI 어시스턴트 페이지
// - 왼쪽: 지도 (마커/폴리곤/비교 인터랙션)
// - 오른쪽: LLM 채팅 인터페이스
// - 가운데: 리사이즈 바
export default function AssistantPage() {
  return <AssistantLayout />;
}
