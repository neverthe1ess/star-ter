"use client";

import { useState, useRef, useEffect } from "react";
import { ChatHeader } from "./ChatHeader";
import { SourceCard } from "./SourceCard";
import { ChatMessage } from "./ChatMessage";
import { ChatInput } from "./ChatInput";
import { useKakaoMap } from "../../hooks/useKakaoMap";


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

  // 지도 DOM 참조 (useRef)
  // useRef: DOM 요소에 직접 접근할 때 사용
  // 지도 라이브러리는 DOM 요소에 직접 렌더링하기 때문에 ref 필요
  const chatMapRef = useRef<HTMLDivElement>(null);

  // 카카오맵 훅 사용
  // useKakaoMap: 카카오맵 SDK를 로드하고 지도 인스턴스를 생성하는 커스텀 훅
  // { map, loaded, error } 반환:
  //   - map: 지도 인스턴스 (위치 이동, 마커 추가 등에 사용)
  //   - loaded: SDK 로드 완료 여부
  //   - error: 에러 메시지
  const { loaded: mapLoaded, error: mapError } = useKakaoMap(chatMapRef, {
    center: { lat: 37.566826, lng: 126.9786567 }, // 서울시청 기본 중심
    level: 4, // 줌 레벨 (낮을수록 확대)
  });


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

  // 메시지 전송 처리
  const handleSendMessage = async (text?: string) => {
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

    // TODO: 백엔드 API 연동 시 아래 더미 응답을 실제 API 호출로 대체
    // 지금은 UI 테스트를 위한 더미 응답
    await simulateAIResponse(messageText);
  };

  // AI 응답 시뮬레이션 (백엔드 연동 전 테스트용)
  const simulateAIResponse = async (userMessage: string) => {
    // 실제 API 호출처럼 약간의 지연 추가
    await new Promise((resolve) => setTimeout(resolve, 1500));

    const aiMessage: Message = {
      id: crypto.randomUUID(),
      role: "assistant",
      content: `이것은 "${userMessage}"에 대한 AI 응답입니다.\n\n아직 백엔드가 연결되지 않아 더미 응답을 보여드립니다. 실제 구현 시 여기에 AI의 분석 결과, 추천 정보 등이 표시됩니다.\n\n**주요 기능:**\n- 상권 분석 질문 응답\n- 추천 장소 안내\n- 관련 데이터 시각화`,
      timestamp: new Date(),
      sources: [
        {
          id: "1",
          title: "Sample Source 1",
          url: "https://example.com",
          number: 1,
        },
        {
          id: "2",
          title: "Sample Source 2",
          url: "https://example2.com",
          number: 2,
        },
      ],
    };

    setMessages((prev) => [...prev, aiMessage]);
    setIsLoading(false);
  };

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

  // ============================================
  // Render (렌더링)
  // ============================================
  // JSX: JavaScript + XML 문법으로 UI 구조 표현

  return (
    <div className="flex h-screen bg-[#f7f7f8] py-4 pr-4 gap-4">
      {/* 지도 영역 (왼쪽) - 토글로 열고 닫을 수 있음 */}
      {/* 
        지도 영역 (왼쪽) - CSS로 표시/숨김 제어
        
        왜 조건부 렌더링({isMapOpen && ...}) 대신 CSS를 사용하는가?
        - useKakaoMap 훅은 컴포넌트 최상위에서 호출됨
        - 훅이 ref.current를 사용해 지도를 생성하려면 DOM이 존재해야 함
        - 조건부 렌더링을 사용하면 isMapOpen=false일 때 DOM이 없어서 훅 실패
        - CSS로 숨기면 DOM은 존재하고, 화면에만 안 보임
      */}
      <div 
        className={`relative bg-white rounded-2xl shadow-lg overflow-hidden
                    transition-all duration-300 ${
                      isMapOpen 
                        ? "w-[400px] h-full" 
                        : "w-0 h-full opacity-0 pointer-events-none"
                    }`}
      >
        {/* 닫기 버튼 - 지도 위에 플로팅 */}
        <button
          onClick={() => setIsMapOpen(false)}
          className="absolute top-3 right-3 z-10 p-2 bg-white/80 backdrop-blur-sm 
                     hover:bg-white rounded-lg shadow-md transition-colors"
          title="지도 닫기"
        >
          <svg className="w-5 h-5 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        
        {/* 카카오맵 렌더링 영역 */}
        <div ref={chatMapRef} className="h-full w-full">
          {/* 로딩 상태 표시 */}
          {!mapLoaded && !mapError && (
            <div className="h-full flex items-center justify-center bg-slate-100">
              <div className="text-center text-slate-400">
                <div className="w-8 h-8 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin mx-auto mb-2" />
                <p className="text-sm">지도 로딩 중...</p>
              </div>
            </div>
          )}
          {/* 에러 상태 표시 */}
          {mapError && (
            <div className="h-full flex items-center justify-center bg-red-50">
              <div className="text-center text-red-500">
                <p className="text-sm">{mapError}</p>
              </div>
            </div>
          )}
        </div>
      </div>

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
          <div className="flex-1 overflow-y-auto px-6 py-4">
            <div className="max-w-3xl mx-auto space-y-6">
              {messages.length === 0 ? (
                // 빈 상태 (대화 시작 전)
                <div className="flex flex-col items-center justify-center h-full py-20">
                  <div className="w-16 h-16 bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl flex items-center justify-center mb-6">
                    <svg
                      className="w-8 h-8 text-slate-400"
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
                  <h2 className="text-xl font-semibold text-slate-800 mb-2">
                    무엇을 도와드릴까요?
                  </h2>
                  <p className="text-slate-500 text-center max-w-md">
                    상권 분석, 창업 정보, 매물 추천 등 다양한 질문을 해보세요.
                  </p>
                </div>
              ) : (
                // 메시지 목록 렌더링
                messages.map((message) => (
                  <div key={message.id}>
                    {/* AI 메시지에 출처 카드 표시 */}
                    {message.role === "assistant" && message.sources && (
                      <div className="mb-4">
                        <div className="flex items-center gap-2 mb-3">
                          <svg
                            className="w-4 h-4 text-slate-400"
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
                          <span className="text-sm font-medium text-slate-600">
                            Sources
                          </span>
                        </div>
                        <div className="flex gap-3 flex-wrap">
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
                <div className="flex items-center gap-3 text-slate-500">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" />
                    <span
                      className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0.1s" }}
                    />
                    <span
                      className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0.2s" }}
                    />
                  </div>
                  <span className="text-sm">AI가 응답을 생성하고 있습니다...</span>
                </div>
              )}

              {/* 스크롤 앵커 */}
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* 입력창 영역 - 경계 없이 간격만 */}
          <div className="px-6 pb-6 pt-4">
            <div className="max-w-3xl mx-auto">
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
