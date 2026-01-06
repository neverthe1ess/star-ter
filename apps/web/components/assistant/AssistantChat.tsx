'use client';

import React, { useState, useRef, useEffect, FormEvent } from 'react';
import { Send, Sparkles } from 'lucide-react';
import { mapBackendAction, getActionLabel } from '@/utils/action-mapper';
import type { AssistantAction, ChatMessage } from '@/types/assistant-types';

// Props 타입
interface AssistantChatProps {
  onAction: (action: AssistantAction) => void;
}

// 모던 LLM 스타일 채팅 UI
// - 큼직한 카드형 말풍선
// - 넓은 간격과 여백
// - 깔끔한 입력창
export default function AssistantChat({ onAction }: AssistantChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      role: 'assistant',
      content: '안녕하세요! 🏪\nAI 상권 분석 어시스턴트입니다.',
      timestamp: new Date(),
    },
    {
      id: '2',
      role: 'assistant',
      content: '어떤 상권에 대해 알아보고 싶으신가요?\n예를 들어, 특정 지역의 매출 현황이나 유동인구 정보를 분석해드릴 수 있어요.',
      timestamp: new Date(),
      card: {
        title: '이런 질문을 해보세요',
        items: [
          '강남역 상권의 매출 분석해줘',
          '홍대 vs 이태원 비교해줘',
          'MZ세대가 많이 가는 상권 추천해줘',
        ],
      },
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 메시지 추가 시 자동 스크롤
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // 메시지 전송 처리
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000'}/ai/message?message=${encodeURIComponent(userMessage.content)}`
      );
      const data = await response.json();

      // 백엔드: { reply: string, actions: Action[] }
      const replyContent = data.reply || data.message || '응답을 처리하는 중 문제가 발생했습니다.';
      
      // Actions 변환 (action-mapper 유틸리티 사용)
      let action: AssistantAction | null = null;
      
      if (data.actions && Array.isArray(data.actions) && data.actions.length > 0) {
        const backendAction = data.actions[0];
        action = mapBackendAction(backendAction.type, backendAction.payload || {});
      }

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: replyContent,
        timestamp: new Date(),
        action: action || undefined,
      };

      setMessages((prev) => [...prev, assistantMessage]);

      if (action) {
        onAction(action);
      }
    } catch (error) {
      console.error('Chat error:', error);
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: '죄송합니다. 요청을 처리하는 중 오류가 발생했습니다.\n잠시 후 다시 시도해주세요.',
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // 예시 질문 클릭 처리
  const handleExampleClick = (question: string) => {
    setInput(question);
  };

  return (
    <div className="flex flex-col h-full bg-apple-gradient relative">
      {/* 메시지 영역 */}
      <div className="flex-1 overflow-y-auto px-4 py-8 no-scrollbar">
        <div className="max-w-5xl mx-auto space-y-8 pb-32">
          {messages.map((message) => (
            <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[90%] space-y-2 ${message.role === 'user' ? 'items-end flex flex-col' : ''}`}>
                
                {/* 어시스턴트 프로필 (작게 표시) */}
                {message.role === 'assistant' && (
                  <div className="flex items-center gap-2 mb-1 px-1">
                    <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center shadow-sm">
                      <Sparkles className="w-3 h-3 text-white" />
                    </div>
                    <span className="text-xs font-semibold text-gray-500">AI Assistant</span>
                  </div>
                )}

                {/* 메시지 버블 */}
                <div
                  className={`relative px-6 py-4 rounded-2xl shadow-sm text-[15px] leading-relaxed transition-all duration-200 ${
                    message.role === 'user'
                      ? 'bg-blue-600 text-white rounded-tr-sm shadow-blue-200'
                      : 'bg-white/80 backdrop-blur-md border border-white/50 text-gray-800 rounded-tl-sm shadow-gray-100'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{message.content}</p>

                  {/* 카드형 컨텐츠 */}
                  {message.card && (
                    <div className="mt-4 p-1 bg-gray-50/50 rounded-xl border border-gray-100/50">
                      <div className="p-3">
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 px-1">{message.card.title}</p>
                        <div className="space-y-1">
                          {message.card.items?.map((item, idx) => (
                            <button
                              key={idx}
                              onClick={() => handleExampleClick(item)}
                              className="w-full text-left px-3 py-2.5 rounded-lg bg-white hover:bg-blue-50/50 text-gray-700 text-sm transition-all duration-200 flex items-center gap-2 group shadow-sm hover:shadow-md border border-transparent hover:border-blue-100"
                            >
                              <span className="w-1.5 h-1.5 rounded-full bg-blue-300 group-hover:bg-blue-500 transition-colors" />
                              {item}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 액션 뱃지 (getActionLabel 사용) */}
                  {message.action && (
                    <div className="absolute -bottom-6 left-1 flex items-center gap-1.5">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                      </span>
                      <span className="text-[11px] font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                        {getActionLabel(message.action.type)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}

          {/* 로딩 인디케이터 */}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white/80 backdrop-blur-sm px-4 py-3 rounded-2xl rounded-tl-sm shadow-sm border border-white/50">
                <div className="flex items-center gap-1">
                  <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* 입력 영역 (Floating) */}
      <div className="absolute bottom-6 left-0 right-0 px-4">
        <div className="max-w-5xl mx-auto">
          <form 
            onSubmit={handleSubmit} 
            className="relative glass rounded-[2rem] shadow-lg shadow-black/5 transition-all duration-300 focus-within:shadow-xl focus-within:scale-[1.01]"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="무엇이든 물어보세요..."
              className="w-full pl-6 pr-14 py-4 bg-transparent border-none focus:ring-0 text-[16px] placeholder:text-gray-400 rounded-[2rem]"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black text-white hover:bg-gray-800 disabled:bg-gray-200 disabled:cursor-not-allowed transition-all duration-200 shadow-md hover:shadow-lg active:scale-95"
            >
              <Send className="w-4 h-4 ml-0.5" />
            </button>
          </form>
          <div className="text-center mt-2">
            <p className="text-[11px] text-gray-400 font-medium">AI는 부정확한 정보를 제공할 수 있습니다.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
