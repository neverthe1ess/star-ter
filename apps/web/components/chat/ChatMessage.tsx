"use client";

import { Share, Edit3, Copy, MoreHorizontal } from "lucide-react";

/**
 * ChatMessage 컴포넌트 - 개별 메시지 렌더링
 *
 * 조건부 렌더링:
 * - message.role에 따라 다른 스타일 적용
 * - "user": 사용자 메시지 (오른쪽 정렬, 보라색 배경)
 * - "assistant": AI 메시지 (왼쪽 정렬, 흰색 배경)
 *
 * 삼항 연산자:
 * - condition ? trueValue : falseValue
 * - JSX 내에서 조건부 스타일링에 자주 사용
 */

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface ChatMessageProps {
  message: Message;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === "user";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-4xl ${
          isUser
            ? "bg-blue-900 text-slate-800 rounded-2xl rounded-br-md px-8 py-6"
            : "bg-white rounded-2xl shadow-sm border border-slate-100 px-8 py-6"
        }`}
      >
        {/* AI 메시지에 Results 헤더 추가 */}
        {!isUser && (
          <div className="flex items-center gap-3 mb-4">
            <svg
              className="w-6 h-6 text-slate-400"
              viewBox="0 0 24 24"
              fill="none"
            >
              <path
                d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span className="text-lg font-medium text-slate-600">Results</span>
          </div>
        )}

        {/* 메시지 내용 */}
        <div
          className={`text-lg leading-relaxed whitespace-pre-wrap ${
            isUser ? "text-white" : "text-slate-700"
          }`}
        >
          {message.content}
        </div>

        {/* AI 메시지에 액션 버튼 추가 */}
        {!isUser && (
          <div className="flex items-center gap-2 mt-6 pt-4 border-t border-slate-100">
            <button className="flex items-center gap-2 px-4 py-2 text-sm text-slate-500 hover:bg-slate-50 rounded-lg transition-colors">
              <Share className="w-4 h-4" />
              Share
            </button>
            <button className="flex items-center gap-2 px-4 py-2 text-sm text-slate-500 hover:bg-slate-50 rounded-lg transition-colors">
              <Edit3 className="w-4 h-4" />
              Rewrite
            </button>
            <div className="flex-1" />
            <button className="flex items-center gap-2 px-4 py-2 text-sm text-slate-500 hover:bg-slate-50 rounded-lg transition-colors">
              <Copy className="w-4 h-4" />
              Copy
            </button>
            <button className="p-2 text-slate-400 hover:bg-slate-50 rounded-lg transition-colors">
              <MoreHorizontal className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
