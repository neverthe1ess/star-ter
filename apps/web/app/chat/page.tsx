"use client";

import { DashboardShell } from "@/components/DashboardShell";
import { ChatPage } from "@/components/chat/ChatPage";

/**
 * /chat 라우트의 진입점
 *
 * Next.js App Router 개념:
 * - app/chat/page.tsx 파일 = /chat URL 경로 자동 생성
 * - "use client" 지시어: 이 컴포넌트를 클라이언트 사이드에서 렌더링
 * - DashboardShell: 사이드바를 포함한 레이아웃 쉘 컴포넌트
 */
export default function ChatRoutePage() {
  return (
    <DashboardShell>
      <ChatPage />
    </DashboardShell>
  );
}
