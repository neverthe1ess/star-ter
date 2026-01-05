'use client';

import { useEffect, useState, useRef } from 'react';
import type { FormEvent } from 'react';
import { Sparkles, BarChart3, Store, ArrowUp } from 'lucide-react';
import { ChatMessage } from '@/services/chat/types';
import { useSidebarStore } from '@/stores/useSidebarStore';
import { sendMessage } from '@/services/chat/chat.repository.api';

/**
 * AI Chat Sidebar Component
 * - Styled via Tailwind Utility Classes (Inline)
 */
export default function AIChatSidebar() {
  // 독립적인 채팅 메시지 상태 (초기화 방지)
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [isSending, setIsSending] = useState(false);


  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isSending) return;

    const form = e.currentTarget;
    const formData = new FormData(form);
    const message = (formData.get('message') ?? '').toString().trim();
    if (!message) return;

    // Optimistic Update: Show user message immediately
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: message,
      timestamp: new Date(),
    };

    setChatMessages((prev) => [...prev, userMessage]);
    form.reset();

    setIsSending(true);
    try {
      const assistantMessage = await sendMessage(message, [
        ...chatMessages,
        userMessage,
      ]);
      setChatMessages((prev) => [...prev, assistantMessage]);

      if (assistantMessage.actions && assistantMessage.actions.length > 0) {
        const { ActionExecutor } = await import('@/services/action-executor');
        ActionExecutor.execute(assistantMessage.actions);
      }
    } catch (error) {
      console.error('[AIChatSidebar] sendMessage failed:', error);
      setChatMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          role: 'assistant',
          content: '요청 처리 중 오류가 발생했어요. 잠시 후 다시 시도해 주세요.',
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsSending(false);
    }
  };

  // Resizing Logic
  // Global State for Sidebar
  const { width, isOpen, setIsOpen } = useSidebarStore();

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages.length]);

  return (
    <>
      {/* Toggle Button */}
      {/* Sidebar가 닫히면 버튼만 둥둥 떠있게 되므로, 항상 최상단에 고정합니다. */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-5 right-5 z-[60] flex h-10 w-10 items-center justify-center rounded-full bg-transparent text-blue-600 transition-all hover:bg-blue-50 active:scale-90"
        aria-label={isOpen ? 'Close Sidebar' : 'Open Sidebar'}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-6 w-6"
        >
          <rect width="18" height="18" x="3" y="3" rx="2" />
          <path d="M15 3v18" />
          {isOpen && (
            <path
              d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4V3z"
              fill="currentColor"
              stroke="none"
            />
          )}
        </svg>
      </button>

      {/* Sidebar Container */}
      <aside
        style={{ width: `${width}px` }}
        className={`fixed top-2 right-2 bottom-2 z-50 flex flex-col bg-transparent transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : 'translate-x-[calc(100%+20px)]'
        }`}
      >
        {/* Resizer Handle (Wider hit area with visible line) */}
        <div className="group absolute -left-3 top-0 z-50 flex h-full w-6 cursor-ew-resize justify-center bg-transparent">
          <div className="my-6 w-1 transition-colors group-hover:bg-blue-400/50 group-active:bg-blue-600" />
        </div>

        {/* Wrapper for rounded corners content */}
        <div className="flex h-full w-full flex-col overflow-hidden rounded-3xl border-l border-gray-200 bg-blue-100/30 shadow-xl isolate backdrop-blur-xs">
          {/* Header */}
          <header className="flex h-16 items-center border-b border-gray-200/50 bg-white/80 px-6 rounded-t-3xl isolate backdrop-blur-xs">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-blue-600" fill="currentColor" />
              <h2 className="text-xl font-semibold text-gray-800">AI Coach</h2>
            </div>
          </header>

          {/* Main Content Area */}
          <div
            ref={scrollContainerRef}
            className="flex flex-1 flex-col overflow-y-auto p-6 [&::-webkit-scrollbar]:hidden [scrollbar-width:none]"
          >
            {/* Messages */}
            {chatMessages && chatMessages.length > 0 ? (
              <div className="space-y-4">
                {chatMessages.map((msg: ChatMessage, idx: number) => (
                  <div
                    key={idx}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm ${
                        msg.role === 'user'
                          ? 'bg-blue-600 text-white'
                          : 'bg-white text-gray-800 shadow-sm border border-gray-100'
                      }`}
                    >
                      {msg.content}
                    </div>
                  </div>
                ))}
                {isSending && (
                  <div className="flex justify-start">
                    <div className="flex space-x-1 rounded-2xl bg-white px-4 py-3 shadow-sm border border-gray-100">
                      <div className="h-2 w-2 animate-bounce rounded-full bg-gray-400 [animation-delay:-0.3s]"></div>
                      <div className="h-2 w-2 animate-bounce rounded-full bg-gray-400 [animation-delay:-0.15s]"></div>
                      <div className="h-2 w-2 animate-bounce rounded-full bg-gray-400"></div>
                    </div>
                  </div>
                )}
                {/* Scroll Anchor */}
                <div ref={messagesEndRef} />
              </div>
            ) : (
              /* Greeting & Suggestions*/
              <>
                <div className="mt-10 mb-8 text-center">
                  <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-100/50 text-blue-600">
                    <Sparkles className="h-8 w-8" fill="currentColor" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">
                    안녕하세요, 사장님
                    <br />
                    무엇을 도와드릴까요?
                  </h3>
                </div>

                <div className="grid grid-cols-1 gap-3">
                  <button className="group flex flex-col items-start rounded-xl border border-gray-300 bg-white p-4 text-left shadow-sm transition-all hover:border-blue-500 hover:bg-blue-50/100 hover:shadow-md">
                    <div className="mb-2 flex items-center gap-2 text-xs font-semibold text-gray-500 group-hover:text-blue-600">
                      <BarChart3 className="h-4 w-4" />
                      <span>매출 요약</span>
                    </div>
                    <p className="text-sm text-gray-700">
                      이 입지에서{' '}
                      <span className="font-bold text-blue-600">치킨집</span>의
                      평균 매출을 요약해서 정리해줘
                    </p>
                  </button>

                  <button className="group flex flex-col items-start rounded-xl border border-gray-300 bg-white p-4 text-left shadow-sm transition-all hover:border-blue-500 hover:bg-blue-50/100 hover:shadow-md">
                    <div className="mb-2 flex items-center gap-2 text-xs font-semibold text-gray-500 group-hover:text-blue-600">
                      <Store className="h-4 w-4" />
                      <span>업종 / 메뉴 추천</span>
                    </div>
                    <p className="text-sm text-gray-700">
                      이 상권에서{' '}
                      <span className="font-bold text-blue-600">
                        잘 맞는 업종 5개
                      </span>
                      를 추천하고, 체인점 설명해줘
                    </p>
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Input Area */}
          <div className="p-4 rounded-bl-3xl">
            <form
              onSubmit={handleSubmit}
              className="relative group"
            >
              <textarea
                name="message"
                placeholder="AI Coach에 메시지 보내기"
                className="w-full resize-none rounded-2xl border border-gray-300 bg-white p-3 text-sm text-gray-800 placeholder:text-gray-400 focus:border-blue-200 focus:ring-1 focus:ring-blue-500 focus:outline-none transition-all duration-300 ease-in-out h-14 pb-3 group-focus-within:h-32 group-focus-within:pb-12"
                onFocus={() => {
                  const container = scrollContainerRef.current;
                  if (!container) return;

                  // Check if user is near bottom (threshold 20px)
                  const isNearBottom =
                    container.scrollHeight - container.scrollTop <=
                    container.clientHeight + 20;

                  if (isNearBottom) {
                    const startTime = Date.now();
                    const duration = 400;
                    const animateScroll = () => {
                      const now = Date.now();
                      scrollToBottom('auto');
                      if (now - startTime < duration) {
                        requestAnimationFrame(animateScroll);
                      }
                    };
                    requestAnimationFrame(animateScroll);
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    if (e.nativeEvent.isComposing) return;
                    e.preventDefault();
                    (e.currentTarget.form as HTMLFormElement).requestSubmit();
                  }
                }}
              />
              <button
                type="submit"
                disabled={isSending}
                className="absolute right-3 bottom-3 flex items-center gap-1 rounded-xl bg-gray-900 px-4 py-2 text-xs font-medium text-white transition-opacity hover:bg-gray-800 disabled:opacity-50 opacity-0 pointer-events-none duration-100 group-focus-within:opacity-100 group-focus-within:pointer-events-auto group-focus-within:duration-300"
              >
                질문하기
                <ArrowUp className="h-3 w-3" />
              </button>
            </form>
          </div>
        </div>
      </aside>
    </>
  );
}
