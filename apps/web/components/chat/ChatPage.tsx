"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { TrendingUp, Flame, Users, CircleDollarSign } from "lucide-react";
import { ChatHeader } from "./ChatHeader";
import { SourceCard } from "./SourceCard";
import { ChatMessage } from "./ChatMessage";
import { ChatInput } from "./ChatInput";
import { ChatMapSection, type ChatMapSectionRef } from "./ChatMapSection";
// 타입은 공유, 함수는 Server Action 사용
import { type AiAction } from "../../lib/api/ai"; 
import { sendMessage } from "../../app/actions/chat";
import { useSearchParams, useRouter } from "next/navigation";


/**
 * ChatPage 컴포넌트 - AI 챗봇의 메인 페이지
 *
 * React 컴포넌트 개념:
 * - 컴포넌트: UI를 구성하는 독립적인 재사용 가능한 조각
 * - Props: 부모에서 자식으로 데이터를 전달하는 방법
 * - State: 컴포넌트 내부에서 관리하는 변경 가능한 데이터
 *
 * 상태 관리 (useState):
 * - messages: 대화 메시지 목록
 * - inputValue: 입력창의 현재 텍스트
 * - isLoading: AI 응답 대기 중 여부
 */

// 메시지 타입 정의 (TypeScript Interface)
interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  sources?: Source[];
}

// 출처 정보 타입
interface Source {
  id: string;
  title: string;
  url: string;
  favicon?: string;
  number: number;
}

// 현재 스레드 타입
interface Thread {
  id: string;
  title: string;
  createdAt: Date;
}

export function ChatPage() {
  // ============================================
  // State (상태) 관리
  // ============================================
  // useState 훅: 컴포넌트의 상태를 선언하고 관리
  // 형태: const [상태값, 상태변경함수] = useState(초기값);

  // 현재 대화 메시지 목록
  const [messages, setMessages] = useState<Message[]>([]);

  // 입력창 텍스트
  const [inputValue, setInputValue] = useState("");

  // AI 응답 로딩 상태
  const [isLoading, setIsLoading] = useState(false);

  // 현재 스레드 정보
  const [currentThread, setCurrentThread] = useState<Thread>({
    id: "default",
    title: "New Thread",
    createdAt: new Date(),
  });

  const [isMapOpen, setIsMapOpen] = useState(false);



  // 지도 섹션 참조 (액션 실행용)
  const mapSectionRef = useRef<ChatMapSectionRef>(null);


  // 스크롤 컨테이너 참조 (useRef)
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // ============================================
  // Effects (부수 효과)
  // ============================================
  // useEffect 훅: 컴포넌트 렌더링 후 실행되는 코드
  // 의존성 배열: [] = 마운트 시 1회, [messages] = messages 변경 시 실행

  // 새 메시지 추가 시 스크롤 맨 아래로 이동
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // localStorage에서 대화 내역 불러오기 (마운트 시)
  useEffect(() => {
    const savedMessages = localStorage.getItem("chat_messages");
    if (savedMessages) {
      try {
        const parsed = JSON.parse(savedMessages);
        // Date 객체로 변환 (JSON.parse는 Date를 문자열로 반환)
        const restored = parsed.map((msg: Message) => ({
          ...msg,
          timestamp: new Date(msg.timestamp),
        }));
        setMessages(restored);
      } catch {
        console.error("Failed to parse saved messages");
      }
    }
  }, []);

  // 메시지 변경 시 localStorage에 저장
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem("chat_messages", JSON.stringify(messages));
    }
  }, [messages]);





  // ============================================
  // Event Handlers (이벤트 핸들러)
  // ============================================

  // AI 액션 처리 핸들러
  // useCallback으로 감싸서 handleSendMessage의 의존성으로 사용할 때 불필요한 변경 방지
  const handleAiActions = useCallback((actions: AiAction[]) => {
    actions.forEach(action => {
      console.log("[ChatPage] Handling Action:", action);
      
      try {
        // 1. 지도 패널 열기
        if (action.type === 'ui.open_panel') {
          setIsMapOpen(true);
        }

        // 2. 지도 이동 (중심점 이동) 등 지도 관련 액션
        // ChatMapSection으로 위임
        if (mapSectionRef.current) {
           mapSectionRef.current.executeAction(action);
        }
      } catch (e) {
        console.error("Failed to execute action:", action, e);
      }
    });
  }, []);

  // 메시지 전송 처리
  const handleSendMessage = useCallback(async (text?: string) => {
    // text가 문자열이 아닌 경우 (이벤트 객체가 전달되는 경우 등) 무시
    const messageText = typeof text === "string" ? text : inputValue.trim();
    if (!messageText) return;

    // 사용자 메시지 추가
    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: messageText,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);

    // 스레드 제목 업데이트 (첫 메시지인 경우)
    if (messages.length === 0) {
      setCurrentThread((prev) => ({
        ...prev,
        title: messageText.slice(0, 50) + (messageText.length > 50 ? "..." : ""),
      }));
    }

    // 백엔드 API 호출
    try {
      // 히스토리 변환 (현재 메시지 제외, 직전까지의 messages 사용)
      const history = messages.map(msg => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content
      }));

      // Server Action 호출 (비동기)
      const response = await sendMessage(messageText, history);
      
      // AI 응답 메시지 추가
      const aiMessage: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: response.reply,
        timestamp: new Date(),
        // sources: ... (백엔드에서 source를 주면 여기 매핑)
      };

      setMessages((prev) => [...prev, aiMessage]);

      // 액션 처리 (지도 이동 등)
      if (response.actions && response.actions.length > 0) {
        handleAiActions(response.actions);
      }

    } catch (error) {
      console.error("Failed to get AI response:", error);
      // 에러 메시지 표시
      const errorMessage: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: "죄송합니다. 오류가 발생하여 응답을 가져오지 못했습니다. 잠시 후 다시 시도해주세요.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [inputValue, messages, handleAiActions]);



  // 새 스레드 생성
  const handleNewThread = () => {
    setMessages([]);
    setCurrentThread({
      id: crypto.randomUUID(),
      title: "New Thread",
      createdAt: new Date(),
    });
    localStorage.removeItem("chat_messages");
  };

  // URL 쿼리 파라미터 처리 (자동 전송)
  const searchParams = useSearchParams();
  const router = useRouter();
  const hasAutoSent = useRef(false);

  useEffect(() => {
    const query = searchParams.get("q");
    if (query && !hasAutoSent.current) {
      hasAutoSent.current = true;
      // 약간의 지연을 두어 자연스럽게 보이도록 함
      setTimeout(() => {
        handleSendMessage(query);
        // URL 파라미터 제거 (히스토리에 남기지 않음)
        router.replace("/chat");
      }, 500);
    }
  }, [searchParams, router, handleSendMessage]);

  // ============================================
  // Render (렌더링)
  // ============================================
  // JSX: JavaScript + XML 문법으로 UI 구조 표현

  return (
    <div className="flex h-screen bg-[#f7f7f8] py-4 pr-4 gap-4 overflow-hidden">
      {/* 지도 영역 (왼쪽) - 토글로 열고 닫을 수 있음 */}
      <ChatMapSection 
        ref={mapSectionRef}
        isOpen={isMapOpen}
      />

      {/* 메인 채팅 영역 (사이드바 스타일과 일치) */}
      <div className="flex-1 flex flex-col bg-white rounded-2xl shadow-lg overflow-hidden">
        {/* 헤더 영역 */}
        <ChatHeader
          threadTitle={currentThread.title}
          onNewThread={handleNewThread}
          isMapOpen={isMapOpen}
          onMapToggle={() => setIsMapOpen(!isMapOpen)}
        />

        {/* 메인 콘텐츠 영역 */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* 메시지 목록 */}
          <div className="flex-1 overflow-y-auto px-8 py-6">
            <div className="max-w-5xl mx-auto space-y-8">
              {messages.length === 0 ? (
                // 빈 상태 (대화 시작 전)
                <div className="flex flex-col items-center justify-center h-full py-20 px-4">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-3xl flex items-center justify-center mb-6 shadow-sm">
                    <svg
                      className="w-10 h-10 text-blue-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                      />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-bold text-slate-800 mb-2">
                    무엇을 도와드릴까요?
                  </h2>
                  <p className="text-lg text-slate-500 text-center mb-10 max-w-lg">
                    상권 분석부터 창업 상세 견적까지,<br className="hidden sm:block" />
                    AI 전문가에게 무엇이든 물어보세요.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-4xl">
                    <button
                      onClick={() => handleSendMessage("강남구 역세권 치킨집 상권 분석해줘")}
                      className="text-left p-7 rounded-3xl bg-white border border-slate-200 hover:border-slate-400 hover:shadow-xl transition-all group flex flex-col items-start"
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <TrendingUp className="w-8 h-8 text-slate-600" />
                        <span className="text-xl font-bold text-slate-800 group-hover:text-slate-600">상권 분석</span>
                      </div>
                      <span className="block text-base text-slate-500">강남구 역세권 치킨집 상권 분석해줘</span>
                    </button>
                    <button
                      onClick={() => handleSendMessage("서울시 뜨는 상권 추천해줘")}
                      className="text-left p-7 rounded-3xl bg-white border border-slate-200 hover:border-slate-400 hover:shadow-xl transition-all group flex flex-col items-start"
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <Flame className="w-8 h-8 text-slate-600" />
                        <span className="text-xl font-bold text-slate-800 group-hover:text-slate-600">뜨는 상권</span>
                      </div>
                      <span className="block text-base text-slate-500">서울시 뜨는 상권 추천해줘</span>
                    </button>
                    <button
                      onClick={() => handleSendMessage("마포구 유동인구 많은 곳 알려줘")}
                      className="text-left p-7 rounded-3xl bg-white border border-slate-200 hover:border-slate-400 hover:shadow-xl transition-all group flex flex-col items-start"
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <Users className="w-8 h-8 text-slate-600" />
                        <span className="text-xl font-bold text-slate-800 group-hover:text-slate-600">유동인구</span>
                      </div>
                      <span className="block text-base text-slate-500">마포구 유동인구 많은 곳 알려줘</span>
                    </button>
                    <button
                      onClick={() => handleSendMessage("성수동 카페 창업 비용 견적 내줘")}
                      className="text-left p-7 rounded-3xl bg-white border border-slate-200 hover:border-slate-400 hover:shadow-xl transition-all group flex flex-col items-start"
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <CircleDollarSign className="w-8 h-8 text-slate-600" />
                        <span className="text-xl font-bold text-slate-800 group-hover:text-slate-600">창업 비용</span>
                      </div>
                      <span className="block text-base text-slate-500">성수동 카페 창업 비용 견적 내줘</span>
                    </button>
                  </div>
                </div>
              ) : (
                // 메시지 목록 렌더링
                messages.map((message) => (
                  <div key={message.id}>
                    {/* AI 메시지에 출처 카드 표시 */}
                    {message.role === "assistant" && message.sources && (
                      <div className="mb-6">
                        <div className="flex items-center gap-2 mb-4">
                          <svg
                            className="w-6 h-6 text-slate-400"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                            />
                          </svg>
                          <span className="text-base font-medium text-slate-600">
                            Sources
                          </span>
                        </div>
                        <div className="flex gap-4 flex-wrap">
                          {message.sources.map((source) => (
                            <SourceCard key={source.id} source={source} />
                          ))}
                        </div>
                      </div>
                    )}
                    <ChatMessage message={message} />
                  </div>
                ))
              )}

              {/* 로딩 인디케이터 */}
              {isLoading && (
                <div className="flex items-center gap-4 text-slate-500 pl-2">
                  <div className="flex gap-1.5">
                    <span className="w-3 h-3 bg-slate-400 rounded-full animate-bounce" />
                    <span
                      className="w-3 h-3 bg-slate-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0.1s" }}
                    />
                    <span
                      className="w-3 h-3 bg-slate-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0.2s" }}
                    />
                  </div>
                  <span className="text-lg">AI가 응답을 생성하고 있습니다...</span>
                </div>
              )}

              {/* 스크롤 앵커 */}
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* 입력창 영역 - 경계 없이 간격만 */}
          <div className="px-8 pb-8 pt-6">
            <div className="max-w-5xl mx-auto">
              <ChatInput
                value={inputValue}
                onChange={setInputValue}
                onSend={handleSendMessage}
                isLoading={isLoading}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
