'use client';

import { useState } from 'react';
import { Copy, MoreHorizontal, Bot } from 'lucide-react';
import { ChartRenderer, type ChartAction } from './charts';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

/**
 * ChatMessage 컴포넌트 - 개별 메시지 렌더링
 *
 * 조건부 렌더링:
 * - message.role에 따라 다른 스타일 적용
 * - "user": 사용자 메시지 (오른쪽 정렬, 파란색 배경)
 * - "assistant": AI 메시지 (왼쪽 정렬, 흰색 배경, 마크다운 렌더링)
 *
 * 차트 렌더링:
 * - AI 메시지에서 chartActions가 있으면 말풍선 안에 차트 표시
 */

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface ChatMessageProps {
  message: Message;
  chartActions?: ChartAction[]; // 차트 액션 (AI 메시지용)
}

export function ChatMessage({ message, chartActions }: ChatMessageProps) {
  const isUser = message.role === 'user';
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // 차트 액션만 필터링
  const chartOnlyActions = chartActions?.filter(
    (a) => a.type.startsWith('chart.') || a.type.startsWith('list.'),
  );

  // 숨겨진 markers 텍스트 제거
  const displayContent = message.content.split('\n\n[매물 목록 참조용')[0];

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-4xl ${
          isUser
            ? 'bg-primary text-primary-foreground rounded-2xl rounded-br-md px-8 py-6'
            : 'bg-background rounded-2xl shadow-sm border border-border px-8 py-6'
        }`}
      >
        {/* AI 메시지에 Results 헤더 추가 */}
        {!isUser && (
          <div className="flex items-center justify-between mb-4 relative">
            <div className="flex items-center gap-3">
              <Bot className="w-6 h-6 text-muted-foreground" />
              <span className="text-body font-medium text-muted-foreground">
                AI Assistant
              </span>
            </div>

            {/* 더보기 메뉴 버튼 */}
            <div className="relative">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-1.5 text-muted-foreground hover:bg-muted rounded-lg transition-colors"
                aria-label="More actions"
              >
                <MoreHorizontal className="w-5 h-5" />
              </button>

              {/* 드롭다운 메뉴 */}
              {isMenuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setIsMenuOpen(false)}
                  />
                  <div className="absolute right-0 top-full mt-1 w-32 bg-background rounded-xl shadow-xl border border-border z-20 py-1 overflow-hidden">
                    <button
                      className="w-full flex items-center gap-2 px-3 py-2 text-caption text-foreground hover:bg-muted transition-colors text-left"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <Copy className="w-4 h-4" />
                      Copy
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* 메시지 내용 */}
        {isUser ? (
          // 사용자 메시지: 일반 텍스트
          <div className="text-body leading-relaxed whitespace-pre-wrap text-primary-foreground font-strong">
            {displayContent}
          </div>
        ) : (
          // AI 메시지: 마크다운 렌더링
          <ReactMarkdown
            className="prose prose-slate max-w-none text-body text-foreground leading-relaxed font-medium"
            remarkPlugins={[remarkGfm]}
            components={{
              // 굵은 텍스트
              strong: ({ children }) => (
                <strong className="font-bold text-foreground">
                  {children}
                </strong>
              ),
              // 제목
              h1: ({ children }) => (
                <h1 className="text-h4 font-bold text-foreground mt-4 mb-2">
                  {children}
                </h1>
              ),
              h2: ({ children }) => (
                <h2 className="text-h5 font-bold text-foreground mt-3 mb-2">
                  {children}
                </h2>
              ),
              h3: ({ children }) => (
                <h3 className="text-body font-bold text-foreground mt-2 mb-1">
                  {children}
                </h3>
              ),
              // 목록
              ul: ({ children }) => (
                <ul className="list-disc pl-4 space-y-1 mb-2 text-foreground">
                  {children}
                </ul>
              ),
              ol: ({ children }) => (
                <ol className="list-decimal pl-4 space-y-1 mb-2 text-foreground">
                  {children}
                </ol>
              ),
              li: ({ children }) => (
                <li className="text-foreground">{children}</li>
              ),
              // 단락
              p: ({ children }) => (
                <p className="text-foreground leading-relaxed mb-2">
                  {children}
                </p>
              ),
            }}
          >
            {displayContent}
          </ReactMarkdown>
        )}

        {/* 차트 렌더링 (AI 메시지만, 말풍선 안) */}
        {!isUser && chartOnlyActions && chartOnlyActions.length > 0 && (
          <ChartRenderer actions={chartOnlyActions} className="mt-4 -mx-2" />
        )}
      </div>
    </div>
  );
}
