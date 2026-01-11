"use client";

import { Sparkles, Send, User } from "lucide-react";
import { useState } from "react";

interface ChatContentProps {
  locationName: string;
}

export function ChatContent({ locationName }: ChatContentProps) {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([
    {
      role: "ai",
      content: `안녕하세요! ${locationName} 상권에 대해 분석한 내용을 바탕으로 상담을 도와드리겠습니다. 궁금하신 점이 있으신가요?`,
      suggestions: [
        "이 구역의 주 타겟 연령대는 어떻게 되나요?",
        "임대료 대비 수익률은 어느 정도일까요?",
        "이 상권의 경쟁이 치열한 편인가요?",
      ],
    },
    {
      role: "user",
      content:
        "이 상권에서 20대 여성 고객을 대상으로 한 브런치 카페를 연다면 경쟁력이 있을까요?",
    },
    {
      role: "ai",
      content:
        "좋은 질문입니다! 데이터 분석 결과, 해당 지역은 평일 오전 11시부터 오후 2시 사이의 20대 여성 유동인구가 타 지역 대비 22% 높습니다. 인근에 유사한 브런치 전문점이 2곳 있으나, 두 곳 모두 30-40대 대상이라 20대를 겨냥한 트렌디한 인테리어와 메뉴를 갖춘다면 충분히 경쟁력이 있습니다.",
    },
  ]);

  const handleSend = () => {
    if (!input.trim()) return;
    setMessages([...messages, { role: "user", content: input }]);
    setInput("");
  };

  return (
    <div className="flex flex-col h-full bg-slate-50/30">
      <div className="flex-1 overflow-y-auto p-8 space-y-8">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex gap-4 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
          >
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm ${
                msg.role === "ai"
                  ? "bg-blue-950 text-white"
                  : "bg-slate-200 text-slate-600"
              }`}
            >
              {msg.role === "ai" ? (
                <Sparkles className="w-5 h-5" />
              ) : (
                <User className="w-5 h-5" />
              )}
            </div>

            <div
              className={`max-w-[80%] space-y-3 ${msg.role === "user" ? "items-end" : ""}`}
            >
              <div
                className={`p-5 rounded-2xl shadow-sm border ${
                  msg.role === "ai"
                    ? "bg-white border-slate-100 rounded-tl-none text-slate-800"
                    : "bg-blue-950 border-blue-900 text-white rounded-tr-none"
                }`}
              >
                <p className="text-sm leading-relaxed whitespace-pre-wrap">
                  {msg.content}
                </p>
              </div>

              {msg.role === "ai" && msg.suggestions && (
                <div className="flex flex-wrap gap-2">
                  {msg.suggestions.map((suggestion: string) => (
                    <button
                      key={suggestion}
                      onClick={() => setInput(suggestion)}
                      className="text-[11px] font-bold px-3 py-1.5 bg-white border border-slate-200 rounded-full text-slate-500 hover:border-blue-950 hover:text-blue-950 transition-colors"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="p-8 bg-white border-t border-slate-100">
        <div className="relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="상권 분석 전문가에게 질문하기..."
            className="w-full pl-6 pr-16 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-950/10 focus:border-blue-950 transition-all"
          />
          <button
            onClick={handleSend}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-blue-950 text-white rounded-xl flex items-center justify-center hover:bg-blue-900 transition-colors shadow-md"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
        <p className="text-[10px] text-slate-400 mt-3 text-center">
          AI 상담사는 Starter의 실시간 빅데이터를 기반으로 답변합니다.
        </p>
      </div>
    </div>
  );
}
