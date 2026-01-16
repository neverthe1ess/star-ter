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
            ? 'bg-blue-900 text-slate-800 rounded-2xl rounded-br-md px-8 py-6'
            : 'bg-white rounded-2xl shadow-sm border border-slate-100 px-8 py-6'
        }`}
      >
        {/* AI 메시지에 Results 헤더 추가 */}
        {!isUser && (
          <div className="flex items-center justify-between mb-4 relative">
            <div className="flex items-center gap-3">
              <Bot className="w-6 h-6 text-slate-400" />
              <span className="text-body font-medium text-slate-600">
                AI Assistant
              </span>
            </div>

            {/* 더보기 메뉴 버튼 */}
            <div className="relative">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-1.5 text-slate-400 hover:bg-slate-100 rounded-lg transition-colors"
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
                  <div className="absolute right-0 top-full mt-1 w-32 bg-white rounded-xl shadow-xl border border-slate-100 z-20 py-1 overflow-hidden">
                    <button
                      className="w-full flex items-center gap-2 px-3 py-2 text-caption text-slate-600 hover:bg-slate-50 transition-colors text-left"
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
          <div className="text-body leading-relaxed whitespace-pre-wrap text-white font-strong">
            {displayContent}
          </div>
        ) : (
          // AI 메시지: 마크다운 렌더링
          <div className="prose prose-slate prose-lg max-w-none">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                // 굵은 텍스트
                strong: ({ children }) => (
                  <strong className="font-bold text-slate-900">
                    {children}
                  </strong>
                ),
                // 제목
                h1: ({ children }) => (
                  <h1 className="text-h4 font-bold text-slate-800 mt-4 mb-2">
                    {children}
                  </h1>
                ),
                h2: ({ children }) => (
                  <h2 className="text-h5 font-bold text-slate-800 mt-3 mb-2">
                    {children}
                  </h2>
                ),
                h3: ({ children }) => (
                  <h3 className="text-body font-bold text-slate-800 mt-2 mb-1">
                    {children}
                  </h3>
                ),
                // 목록
                ul: ({ children }) => (
                  <ul className="list-disc list-inside space-y-1 my-2">
                    {children}
                  </ul>
                ),
                ol: ({ children }) => (
                  <ol className="list-decimal list-inside space-y-1 my-2">
                    {children}
                  </ol>
                ),
                li: ({ children }) => (
                  <li className="text-slate-700">{children}</li>
                ),
                // 단락
                p: ({ children }) => (
                  <p className="text-slate-700 leading-relaxed mb-2">
                    {children}
                  </p>
                ),
                // 테이블 스타일 (GFM Tables)
                table: ({ children }) => (
                  <div className="overflow-x-auto my-4">
                    <table className="min-w-full border-collapse border border-slate-200 rounded-lg overflow-hidden">
                      {children}
                    </table>
                  </div>
                ),
                thead: ({ children }) => (
                  <thead className="bg-slate-100">{children}</thead>
                ),
                tbody: ({ children }) => (
                  <tbody className="divide-y divide-slate-200">{children}</tbody>
                ),
                tr: ({ children }) => (
                  <tr className="hover:bg-slate-50 transition-colors">{children}</tr>
                ),
                th: ({ children }) => (
                  <th className="px-4 py-3 text-left text-md font-semibold text-slate-700 border-b border-slate-200">
                    {children}
                  </th>
                ),
                td: ({ children }) => (
                  <td className="px-4 py-3 text-md text-slate-600 border-b border-slate-100">
                    {children}
                  </td>
                ),
              }}
            >
              {displayContent}
            </ReactMarkdown>
          </div>
        )}

        {/* 차트 렌더링 (AI 메시지만, 말풍선 안) */}
        {!isUser && chartOnlyActions && chartOnlyActions.length > 0 && (
          <ChartRenderer actions={chartOnlyActions} className="mt-4 -mx-2" />
        )}
      </div>
    </div>
  );
}
