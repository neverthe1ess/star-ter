"use client";

import {
  ArrowLeft,
  TrendingUp,
  Users,
  BarChart3,
  Building2,
  MessageSquare,
  GripVertical,
  Sparkles,
  Send,
  User,
  X,
} from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { useState } from "react";
import { Button } from "./ui/button";
import { Resizable } from "re-resizable";

interface Location {
  id: string;
  name: string;
  district: string;
  category: string;
  revenue: string;
  growthRate: number;
  badge: string;
  badgeType: "explosive" | "rapid" | "stable";
  imageUrl: string;
  rank?: number;
}

interface LocationDetailPageProps {
  location: Location;
  onBack: () => void;
  onConsultAI?: () => void;
}

export function LocationDetailPage({ location, onBack, onConsultAI }: LocationDetailPageProps) {
  const [activeTab, setActiveTab] = useState<
    "matching" | "traffic" | "analysis" | "realestate"
  >("matching");
  const [mapWidth, setMapWidth] = useState<number | string>("30%");
  const [isChatMode, setIsChatMode] = useState(false);

  const tabs = [
    {
      id: "matching" as const,
      label: "업종 매칭도",
      icon: TrendingUp,
    },
    { id: "traffic" as const, label: "유동인구", icon: Users },
    {
      id: "analysis" as const,
      label: "업종/매출 분석",
      icon: BarChart3,
    },
    {
      id: "realestate" as const,
      label: "부동산",
      icon: Building2,
    },
  ];

  return (
    <div className="min-h-screen bg-[#f7f7f8]">
      <div className="px-8 py-12">
        <div className="mb-16">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-4">
              <button
                onClick={onBack}
                className="flex items-center justify-center w-12 h-12 rounded-full hover:bg-gray-100 transition-colors flex-shrink-0"
              >
                <ArrowLeft className="w-6 h-6 text-gray-900" />
              </button>
              <h1 className="text-6xl font-semibold text-gray-900">{location.name}</h1>
            </div>
          </div>
          <div className="flex items-center gap-4 mb-8">
            <p className="text-3xl text-gray-400">{location.district}</p>
          </div>
        </div>

        <div className="flex gap-8 h-[calc(100vh-280px)] min-h-[700px] items-stretch overflow-hidden">
          <Resizable
            size={{ width: mapWidth, height: "100%" }}
            onResizeStop={(e, direction, ref) => {
              const parent = ref.parentElement;
              if (parent) {
                const parentWidth = parent.offsetWidth - 32;
                const newWidthPx = ref.offsetWidth;
                const newPercentage = (newWidthPx / parentWidth) * 100;
                setMapWidth(`${newPercentage}%`);
              }
            }}
            minWidth="20%"
            maxWidth="40%"
            enable={{ right: true }}
            handleStyles={{
              right: {
                width: "12px",
                right: "-22px",
                zIndex: 10,
              },
            }}
            handleComponent={{
              right: (
                <div className="h-full flex items-center justify-center group cursor-col-resize">
                  <div className="w-1.5 h-16 bg-slate-300 rounded-full group-hover:bg-blue-600 transition-all group-hover:h-24 group-hover:w-2 flex items-center justify-center shadow-sm">
                    <GripVertical className="w-3 h-3 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>
              ),
            }}
            className="flex-shrink-0"
          >
            <div className="bg-white rounded-[32px] overflow-hidden shadow-sm border border-slate-200 h-full relative">
              <ImageWithFallback
                src="https://images.unsplash.com/photo-1588214224125-ee5e4fa8a426?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzZW91bCUyMG1hcCUyMGFlcmlhbHxlbnwxfHx8fDE3Njc4OTA3MDh8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                alt="상권 지도"
                className="w-full h-full object-cover opacity-60"
              />
              <div className="absolute bottom-6 left-6 right-6 bg-white/90 backdrop-blur-sm rounded-xl p-4 shadow-lg border border-gray-200">
                <p className="text-xs text-gray-600 mb-1">현재 분석 반경</p>
                <p className="text-sm font-bold text-blue-800">반경 500m 이내 고밀도 분석</p>
              </div>
            </div>
          </Resizable>

          <div className="flex flex-col flex-1 min-w-0 h-full overflow-hidden">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-6 flex-shrink-0">
              {isChatMode ? (
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-950 flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">AI 입지 분석 상담사</h3>
                    <p className="text-xs text-slate-500">데이터 기반 실시간 상권 상담 진행 중</p>
                  </div>
                </div>
              ) : (
                <div className="flex gap-1 bg-white p-1 rounded-2xl border border-slate-200 shadow-sm">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as typeof activeTab)}
                      className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
                        activeTab === tab.id
                          ? "bg-blue-950 text-white shadow-md"
                          : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              )}

              <Button
                onClick={() => setIsChatMode(!isChatMode)}
                className={`rounded-xl px-6 py-2.5 font-bold transition-all ${
                  isChatMode
                    ? "bg-white text-slate-900 border border-slate-200 hover:bg-slate-50"
                    : "bg-blue-950 text-white hover:bg-blue-900 shadow-lg"
                }`}
              >
                {isChatMode ? (
                  <>
                    <X className="w-4 h-4 mr-2" />
                    상담 종료
                  </>
                ) : (
                  <>
                    <MessageSquare className="w-4 h-4 mr-2" />
                    AI 분석 상담 시작
                  </>
                )}
              </Button>
            </div>

            <div className="flex-1 min-h-0">
              <div className="h-full bg-white rounded-[32px] shadow-sm border border-slate-200 overflow-hidden flex flex-col">
                <div className="flex-1 overflow-y-auto custom-scrollbar">
                  {isChatMode ? (
                    <ChatContent location={location} />
                  ) : (
                    <div className="p-10">
                      {activeTab === "matching" && <MatchingContent location={location} />}
                      {activeTab === "traffic" && <TrafficContent />}
                      {activeTab === "analysis" && <AnalysisContent />}
                      {activeTab === "realestate" && <RealEstateContent />}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ChatContent({ location }: { location: Location }) {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([
    {
      role: "ai",
      content: `안녕하세요! ${location.name} 상권에 대해 분석한 내용을 바탕으로 상담을 도와드리겠습니다. 궁금하신 점이 있으신가요?`,
      suggestions: [
        "이 구역의 주 타겟 연령대는 어떻게 되나요?",
        "임대료 대비 수익률은 어느 정도일까요?",
        "이 상권의 경쟁이 치열한 편인가요?",
      ],
    },
    {
      role: "user",
      content: "이 상권에서 20대 여성 고객을 대상으로 한 브런치 카페를 연다면 경쟁력이 있을까요?",
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
                msg.role === "ai" ? "bg-blue-950 text-white" : "bg-slate-200 text-slate-600"
              }`}
            >
              {msg.role === "ai" ? <Sparkles className="w-5 h-5" /> : <User className="w-5 h-5" />}
            </div>

            <div className={`max-w-[80%] space-y-3 ${msg.role === "user" ? "items-end" : ""}`}>
              <div
                className={`p-5 rounded-2xl shadow-sm border ${
                  msg.role === "ai"
                    ? "bg-white border-slate-100 rounded-tl-none text-slate-800"
                    : "bg-blue-950 border-blue-900 text-white rounded-tr-none"
                }`}
              >
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
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

function MatchingContent({ location }: { location: Location }) {
  return (
    <div className="space-y-10">
      <div className="space-y-6">
        <h2 className="text-2xl font-black text-slate-900">업종 정밀 매칭 결과</h2>

        <div className="bg-slate-50 rounded-3xl p-8 border border-slate-100">
          <div className="flex flex-col lg:flex-row items-center gap-10">
            <div className="relative flex-shrink-0">
              <svg className="w-32 h-32 transform -rotate-90">
                <circle
                  cx="64"
                  cy="64"
                  r="58"
                  stroke="currentColor"
                  strokeWidth="10"
                  fill="transparent"
                  className="text-slate-200"
                />
                <circle
                  cx="64"
                  cy="64"
                  r="58"
                  stroke="currentColor"
                  strokeWidth="10"
                  fill="transparent"
                  strokeDasharray={364}
                  strokeDashoffset={364 * (1 - 0.98)}
                  className="text-blue-950"
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-3xl font-black text-blue-950">98%</span>
              </div>
            </div>

            <div className="space-y-3 text-center lg:text-left">
              <h3 className="text-xl font-bold text-blue-950 leading-tight">
                "이곳은 사장님에게 최고의 선택지입니다"
              </h3>
              <p className="text-slate-500 text-base leading-relaxed break-keep">
                자본금 7천만원 규모와 MZ세대 타겟팅을 고려했을 때, 인근 경쟁 업종 대비 희소성이 높고
                주중/주말 유동인구 밸런스가 매우 뛰어납니다.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-8 bg-slate-50/50 border border-slate-100 rounded-3xl">
          <p className="text-slate-400 text-sm font-bold mb-3 uppercase tracking-wider">예상 월 매출액</p>
          <div className="flex items-baseline gap-2 mb-2">
            <span className="text-3xl font-black text-blue-950">4,250만원</span>
          </div>
          <p className="text-green-600 text-sm font-bold flex items-center gap-1">
            <span>▲</span> 주변 평균 대비 15% 높음
          </p>
        </div>

        <div className="p-8 bg-slate-50/50 border border-slate-100 rounded-3xl">
          <p className="text-slate-400 text-sm font-bold mb-3 uppercase tracking-wider">초기 예상 창업 비용</p>
          <div className="flex items-baseline gap-2 mb-2">
            <span className="text-3xl font-black text-blue-950">1억 1,200만원</span>
          </div>
          <p className="text-slate-500 text-sm font-medium">보증금, 권리금, 인테리어 일체 포함</p>
        </div>
      </div>

      <div className="space-y-6">
        <h3 className="text-xl font-bold text-slate-900">핵심 상권 지표</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: "평균 유동인구", value: "15,840명", sub: "일평균" },
            { label: "경쟁 업체 수", value: "12개", sub: "적정 수준", color: "text-green-600" },
            { label: "평균 임대료", value: "280만원", sub: "월평균" },
          ].map((metric) => (
            <div key={metric.label} className="p-6 bg-white border border-slate-100 rounded-2xl shadow-sm">
              <p className="text-xs font-bold text-slate-400 mb-2">{metric.label}</p>
              <p className="text-xl font-black text-slate-900">{metric.value}</p>
              <p className={`text-[11px] font-bold mt-1 ${metric.color || "text-slate-400"}`}>{metric.sub}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-xl font-bold text-slate-900">상권 성장 모멘텀</h3>
        <div className="h-48 bg-slate-50 rounded-[32px] border border-slate-100 relative overflow-hidden p-8 flex items-end gap-3">
          {[40, 60, 45, 80, 70, 95, 85].map((val, i) => (
            <div key={i} className="flex-1 bg-blue-950/5 rounded-t-xl relative group h-full">
              <div
                className="absolute bottom-0 left-0 right-0 bg-blue-950 rounded-t-xl transition-all duration-1000 group-hover:bg-blue-600"
                style={{ height: `${val}%` }}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function TrafficContent() {
  return (
    <div className="space-y-8">
      <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">유동인구 분석</h2>
        <div className="space-y-6">
          <div className="flex items-center justify-between p-6 bg-gray-50 rounded-xl">
            <div>
              <p className="text-sm text-gray-600 mb-1">평일 평균</p>
              <p className="text-3xl font-bold text-gray-900">14,200명</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600 mb-1">주말 평균</p>
              <p className="text-3xl font-bold text-blue-800">18,600명</p>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 mb-3">시간대별 유동인구</h3>
            <div className="space-y-3">
              {[
                "오전 (06-12시)",
                "오후 (12-18시)",
                "저녁 (18-24시)",
              ].map((time, idx) => (
                <div key={time} className="flex items-center gap-4">
                  <span className="text-sm text-gray-600 w-32">{time}</span>
                  <div className="flex-1 bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-blue-800 h-3 rounded-full"
                      style={{ width: `${[60, 85, 70][idx]}%` }}
                    />
                  </div>
                  <span className="text-sm font-semibold text-gray-900 w-16 text-right">
                    {[8520, 12070, 9930][idx]}명
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function AnalysisContent() {
  return (
    <div className="space-y-8">
      <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">업종별 매출 분석</h2>
        <div className="space-y-4">
          {[
            { name: "카페", revenue: "4,250만원", share: 35, color: "bg-blue-600" },
            { name: "음식점", revenue: "3,890만원", share: 28, color: "bg-indigo-600" },
            { name: "소매업", revenue: "2,150만원", share: 20, color: "bg-purple-600" },
            { name: "서비스업", revenue: "1,870만원", share: 17, color: "bg-pink-600" },
          ].map((item) => (
            <div key={item.name} className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-gray-900">{item.name}</span>
                <div className="text-right">
                  <span className="font-bold text-gray-900">{item.revenue}</span>
                  <span className="text-sm text-gray-500 ml-2">({item.share}%)</span>
                </div>
              </div>
              <div className="bg-gray-200 rounded-full h-2">
                <div className={`${item.color} h-2 rounded-full`} style={{ width: `${item.share}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function RealEstateContent() {
  return (
    <div className="space-y-8">
      <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">부동산 정보</h2>
        <div className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="p-6 bg-gray-50 rounded-xl">
              <p className="text-sm text-gray-600 mb-2">평균 보증금</p>
              <p className="text-2xl font-bold text-gray-900">5,000만원</p>
            </div>
            <div className="p-6 bg-gray-50 rounded-xl">
              <p className="text-sm text-gray-600 mb-2">평균 월세</p>
              <p className="text-2xl font-bold text-gray-900">280만원</p>
            </div>
            <div className="p-6 bg-gray-50 rounded-xl">
              <p className="text-sm text-gray-600 mb-2">평균 권리금</p>
              <p className="text-2xl font-bold text-gray-900">3,500만원</p>
            </div>
            <div className="p-6 bg-gray-50 rounded-xl">
              <p className="text-sm text-gray-600 mb-2">평균 평수</p>
              <p className="text-2xl font-bold text-gray-900">25평</p>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 mb-4">인근 매물 정보</h3>
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="p-4 border border-gray-200 rounded-xl hover:border-blue-300 transition-colors cursor-pointer"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-gray-900">상가 {i}층</span>
                    <span className="text-sm px-2 py-1 bg-green-100 text-green-700 rounded">계약가능</span>
                  </div>
                  <div className="text-sm text-gray-600">
                    <p>보증금 5,000만원 / 월세 300만원</p>
                    <p>면적 30평 · 권리금 4,000만원</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
