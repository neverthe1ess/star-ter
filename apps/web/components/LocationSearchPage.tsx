"use client";

import { useState } from "react";
import { ArrowLeft, CheckCircle2, ChevronDown, Heart, Info } from "lucide-react";
import { motion } from "motion/react";
import { ImageWithFallback } from "./figma/ImageWithFallback";

interface LocationRankItem {
  id: string;
  rank: number;
  name: string;
  district: string;
  revenue: string;
  growthRate: number;
  totalRevenue: string;
  ratio: { a: number; b: number };
  status: string;
  statusType: "stable" | "danger" | "hot" | "variable";
  imageUrl: string;
}

const rankData: LocationRankItem[] = [
  {
    id: "1",
    rank: 1,
    name: "성수동 연무장길",
    district: "성수동 · 카페/팝업",
    revenue: "1.2억원",
    growthRate: 15.4,
    totalRevenue: "420.0억원",
    ratio: { a: 45, b: 55 },
    status: "뜨는 상권",
    statusType: "hot",
    imageUrl: "https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?q=80&w=100&h=100&auto=format&fit=crop",
  },
  {
    id: "2",
    rank: 2,
    name: "압구정 로데오",
    district: "신사동 · 다이닝/바",
    revenue: "2.5억원",
    growthRate: 8.2,
    totalRevenue: "850.0억원",
    ratio: { a: 48, b: 52 },
    status: "안정 상권",
    statusType: "stable",
    imageUrl: "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?q=80&w=100&h=100&auto=format&fit=crop",
  },
  {
    id: "3",
    rank: 3,
    name: "한남동 독서당로",
    district: "한남동 · 라이프스타일",
    revenue: "1.8억원",
    growthRate: 12.5,
    totalRevenue: "310.0억원",
    ratio: { a: 42, b: 58 },
    status: "뜨는 상권",
    statusType: "hot",
    imageUrl: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=100&h=100&auto=format&fit=crop",
  },
  {
    id: "4",
    rank: 4,
    name: "을지로 힙지로",
    district: "을지로 · 노포/펍",
    revenue: "9,500만원",
    growthRate: 22.4,
    totalRevenue: "215.0억원",
    ratio: { a: 60, b: 40 },
    status: "변동 상권",
    statusType: "variable",
    imageUrl: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=100&h=100&auto=format&fit=crop",
  },
  {
    id: "5",
    rank: 5,
    name: "연남동 경의선숲길",
    district: "연남동 · 디저트/베이커리",
    revenue: "8,200만원",
    growthRate: 5.8,
    totalRevenue: "180.0억원",
    ratio: { a: 35, b: 65 },
    status: "안정 상권",
    statusType: "stable",
    imageUrl: "https://images.unsplash.com/photo-1533900298318-6b8da08a523e?q=80&w=100&h=100&auto=format&fit=crop",
  },
  {
    id: "6",
    rank: 6,
    name: "망원동 망리단길",
    district: "망원동 · 소품샵/카페",
    revenue: "7,400만원",
    growthRate: 9.1,
    totalRevenue: "120.0억원",
    ratio: { a: 30, b: 70 },
    status: "뜨는 상권",
    statusType: "hot",
    imageUrl: "https://images.unsplash.com/photo-1543007630-9710e4a00a20?q=80&w=100&h=100&auto=format&fit=crop",
  },
  {
    id: "7",
    rank: 6,
    name: "망원동 망리단길",
    district: "망원동 · 소품샵/카페",
    revenue: "7,400만원",
    growthRate: 9.1,
    totalRevenue: "120.0억원",
    ratio: { a: 30, b: 70 },
    status: "뜨는 상권",
    statusType: "hot",
    imageUrl: "https://images.unsplash.com/photo-1543007630-9710e4a00a20?q=80&w=100&h=100&auto=format&fit=crop",
  },
  {
    id: "8",
    rank: 6,
    name: "망원동 망리단길",
    district: "망원동 · 소품샵/카페",
    revenue: "7,400만원",
    growthRate: 9.1,
    totalRevenue: "120.0억원",
    ratio: { a: 30, b: 70 },
    status: "뜨는 상권",
    statusType: "hot",
    imageUrl: "https://images.unsplash.com/photo-1543007630-9710e4a00a20?q=80&w=100&h=100&auto=format&fit=crop",
  },
  {
    id: "9",
    rank: 6,
    name: "망원동 망리단길",
    district: "망원동 · 소품샵/카페",
    revenue: "7,400만원",
    growthRate: 9.1,
    totalRevenue: "120.0억원",
    ratio: { a: 30, b: 70 },
    status: "뜨는 상권",
    statusType: "hot",
    imageUrl: "https://images.unsplash.com/photo-1543007630-9710e4a00a20?q=80&w=100&h=100&auto=format&fit=crop",
  },
  {
    id: "10",
    rank: 6,
    name: "망원동 망리단길",
    district: "망원동 · 소품샵/카페",
    revenue: "7,400만원",
    growthRate: 9.1,
    totalRevenue: "120.0억원",
    ratio: { a: 30, b: 70 },
    status: "뜨는 상권",
    statusType: "hot",
    imageUrl: "https://images.unsplash.com/photo-1543007630-9710e4a00a20?q=80&w=100&h=100&auto=format&fit=crop",
  },
  {
    id: "11",
    rank: 6,
    name: "망원동 망리단길",
    district: "망원동 · 소품샵/카페",
    revenue: "7,400만원",
    growthRate: 9.1,
    totalRevenue: "120.0억원",
    ratio: { a: 30, b: 70 },
    status: "뜨는 상권",
    statusType: "hot",
    imageUrl: "https://images.unsplash.com/photo-1543007630-9710e4a00a20?q=80&w=100&h=100&auto=format&fit=crop",
  },
  {
    id: "12",
    rank: 6,
    name: "망원동 망리단길",
    district: "망원동 · 소품샵/카페",
    revenue: "7,400만원",
    growthRate: 9.1,
    totalRevenue: "120.0억원",
    ratio: { a: 30, b: 70 },
    status: "뜨는 상권",
    statusType: "hot",
    imageUrl: "https://images.unsplash.com/photo-1543007630-9710e4a00a20?q=80&w=100&h=100&auto=format&fit=crop",
  },
  {
    id: "13",
    rank: 6,
    name: "망원동 망리단길",
    district: "망원동 · 소품샵/카페",
    revenue: "7,400만원",
    growthRate: 9.1,
    totalRevenue: "120.0억원",
    ratio: { a: 30, b: 70 },
    status: "뜨는 상권",
    statusType: "hot",
    imageUrl: "https://images.unsplash.com/photo-1543007630-9710e4a00a20?q=80&w=100&h=100&auto=format&fit=crop",
  },
];

export function LocationSearchPage({
  onBack,
  onSelectLocation,
}: {
  onBack?: () => void;
  onSelectLocation: (loc: LocationRankItem) => void;
}) {
  const [activeTab, setActiveTab] = useState("실시간 상권 차트");
  const [subTab, setSubTab] = useState("매출 성장 순");

  const tabs = ["실시간 상권 차트", "지금 뜨는 카테고리", "지역별 소비 동향"];
  const subTabs = [
    "전체",
    "매출 성장 순",
    "유동인구 순",
    "평균 매출 순",
    "신규 입점 순",
    "폐업률 낮은 순",
    "MZ 선호 순",
  ];

  return (
    <div className="flex flex-1 flex-col h-screen bg-[#f7f7f8] py-4 pr-4 overflow-hidden">
      {onBack && (
        <div className="px-4 pb-3">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-slate-500 hover:text-slate-900 text-sm font-semibold"
          >
            <ArrowLeft className="w-4 h-4" />
            뒤로
          </button>
        </div>
      )}

      <div className="flex-1 flex flex-col bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-10 border-b border-gray-100 flex-shrink-0">
          <div className="flex gap-8">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`relative py-5 text-lg font-bold transition-all ${
                  activeTab === tab ? "text-slate-900" : "text-slate-400 hover:text-slate-600"
                }`}
              >
                {tab}
                {activeTab === tab && (
                  <motion.div
                    layoutId="activeTabUnderline"
                    className="absolute bottom-0 left-0 right-0 h-[3px] bg-slate-900 rounded-full"
                  />
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="px-10 py-4 flex items-center justify-between flex-shrink-0 border-b border-gray-50">
          <div className="flex items-center gap-2">
            <div className="flex bg-gray-100 p-1 rounded-xl">
              <button className="px-4 py-2 text-sm font-bold text-slate-700 flex items-center gap-1 hover:bg-white rounded-lg transition-all shadow-sm">
                서울 전체 <ChevronDown className="w-4 h-4" />
              </button>
            </div>
            <div className="flex bg-gray-100 p-1 rounded-xl gap-1">
              {subTabs.slice(1, 7).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setSubTab(tab)}
                  className={`px-4 py-2 text-sm font-bold rounded-lg transition-all ${
                    subTab === tab ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
            <button className="ml-2 p-2 bg-gray-100 rounded-xl text-slate-500 hover:text-slate-700 transition-colors">
              <div className="flex items-center gap-1 px-2 py-0.5 text-sm font-bold">
                실시간 업데이트 <ChevronDown className="w-4 h-4" />
              </div>
            </button>
          </div>

          <button className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-full text-sm font-bold hover:bg-blue-100 transition-colors">
            <CheckCircle2 className="w-4 h-4" />
            포화 상권 제외하기
          </button>
        </div>

        <div className="px-10 py-3 flex items-center text-[13px] font-bold text-slate-400 flex-shrink-0">
          <div className="w-[400px]">순위 · 상권명 / 카테고리</div>
          <div className="flex-1 text-right pr-20">평균 매출(월)</div>
          <div className="w-[180px] text-center">전월 대비</div>
          <div className="w-[200px] text-right pr-10">분기 총 매출</div>
          <div className="w-[220px] flex items-center justify-end gap-1">
            소비자 성별 비율 (남/여) <Info className="w-3.5 h-3.5" />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-6 pb-10 no-scrollbar">
          {rankData.map((item) => (
            <button
              key={`${item.id}-${item.rank}-${item.name}`}
              onClick={() => onSelectLocation(item)}
              className="w-full px-4 py-4 flex items-center hover:bg-slate-50/80 rounded-2xl transition-all group"
            >
              <div className="w-[400px] flex items-center gap-4">
                <Heart className="w-5 h-5 text-slate-300 hover:text-red-500 transition-colors" />
                <span className="w-6 text-lg font-bold text-slate-400 group-hover:text-slate-900 transition-colors">
                  {item.rank}
                </span>
                <div className="relative">
                  <div className="w-12 h-12 rounded-full overflow-hidden border border-gray-100 bg-gray-50">
                    <ImageWithFallback src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-white rounded-full flex items-center justify-center border border-gray-100 shadow-sm">
                    <span className="text-[10px]">📍</span>
                  </div>
                </div>
                <div className="text-left">
                  <div className="text-[15px] font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                    {item.name}
                  </div>
                  <div className="text-[12px] font-medium text-slate-400">{item.district}</div>
                </div>
              </div>

              <div className="flex-1 text-right pr-20 text-[15px] font-bold text-slate-900">{item.revenue}</div>

              <div className="w-[180px] flex justify-center">
                <div
                  className={`px-4 py-1.5 rounded-lg text-sm font-black min-w-[80px] ${
                    item.growthRate > 0 ? "bg-red-50 text-red-500" : "bg-blue-50 text-blue-500"
                  }`}
                >
                  {item.growthRate > 0 ? "+" : ""}
                  {item.growthRate.toFixed(2)}%
                </div>
              </div>

              <div className="w-[200px] text-right pr-10 text-[15px] font-bold text-slate-900">
                {item.totalRevenue}
              </div>

              <div className="w-[220px] flex flex-col items-end gap-1">
                <div className="flex w-full h-1.5 rounded-full overflow-hidden bg-gray-100">
                  <div
                    className="h-full bg-blue-500 transition-all duration-1000"
                    style={{ width: `${item.ratio.a}%` }}
                  />
                  <div
                    className="h-full bg-red-500 transition-all duration-1000"
                    style={{ width: `${item.ratio.b}%` }}
                  />
                </div>
                <div className="flex justify-between w-full text-[11px] font-black text-slate-400">
                  <span className="text-blue-500">{item.ratio.a}</span>
                  <span className="text-red-500">{item.ratio.b}</span>
                </div>
              </div>
            </button>
          ))}

          <div className="mt-8 mb-10 flex justify-center">
            <button className="px-8 py-3 bg-gray-50 text-slate-500 rounded-xl text-sm font-bold hover:bg-gray-100 transition-all">
              더 보기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
