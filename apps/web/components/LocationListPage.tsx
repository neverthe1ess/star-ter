"use client";

import { Clock, Search, Sparkles, TrendingUp } from "lucide-react";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ImageWithFallback } from "./figma/ImageWithFallback";

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

const hotLocations: Location[] = [
  {
    id: "1",
    name: "성수동 카페거리",
    district: "서울 성동구",
    category: "카페",
    revenue: "₩315억 9,840만",
    growthRate: 2623.5,
    badge: "폭발 성장",
    badgeType: "explosive",
    imageUrl: "",
    rank: 1,
  },
  {
    id: "2",
    name: "연남동 골목상권",
    district: "서울 마포구",
    category: "식당",
    revenue: "₩66억 5,025만",
    growthRate: 999.5,
    badge: "폭발 성장",
    badgeType: "explosive",
    imageUrl: "",
    rank: 2,
  },
  {
    id: "3",
    name: "강남역 상권",
    district: "서울 강남구",
    category: "소매",
    revenue: "₩88억 6,519만",
    growthRate: 694.8,
    badge: "급성장",
    badgeType: "rapid",
    imageUrl: "",
    rank: 3,
  },
  {
    id: "4",
    name: "을지로 레트로",
    district: "서울 중구",
    category: "카페",
    revenue: "₩93억 3,420만",
    growthRate: 680.4,
    badge: "급성장",
    badgeType: "rapid",
    imageUrl: "",
    rank: 4,
  },
  {
    id: "5",
    name: "건대입구역",
    district: "서울 광진구",
    category: "편의점",
    revenue: "₩55억 2,100만",
    growthRate: 480.2,
    badge: "급성장",
    badgeType: "rapid",
    imageUrl: "",
    rank: 5,
  },
];

const stableLocations: Location[] = [
  {
    id: "6",
    name: "홍대입구",
    district: "서울 마포구",
    category: "의류",
    revenue: "₩45억 8,200만",
    growthRate: 152.3,
    badge: "안정 성장",
    badgeType: "stable",
    imageUrl: "",
    rank: 6,
  },
  {
    id: "7",
    name: "신촌 거리",
    district: "서울 서대문구",
    category: "식당",
    revenue: "₩38억 1,500만",
    growthRate: 125.7,
    badge: "안정 성장",
    badgeType: "stable",
    imageUrl: "",
    rank: 7,
  },
  {
    id: "8",
    name: "이태원",
    district: "서울 용산구",
    category: "레스토랑",
    revenue: "₩62억 3,400만",
    growthRate: 98.4,
    badge: "안정 성장",
    badgeType: "stable",
    imageUrl: "",
    rank: 8,
  },
];

const trendingLocations: Location[] = [
  {
    id: "11",
    name: "망원 한강공원",
    district: "서울 마포구",
    category: "카페",
    revenue: "₩28억 4,200만",
    growthRate: 1225.4,
    badge: "신흥 트렌드",
    badgeType: "explosive",
    imageUrl: "",
    rank: 11,
  },
  {
    id: "12",
    name: "성북동 골목",
    district: "서울 성북구",
    category: "카페",
    revenue: "₩19억 8,500만",
    growthRate: 988.3,
    badge: "신흥 트렌드",
    badgeType: "explosive",
    imageUrl: "",
    rank: 12,
  },
  {
    id: "13",
    name: "문래 예술촌",
    district: "서울 영등포구",
    category: "갤러리",
    revenue: "₩15억 2,100만",
    growthRate: 825.6,
    badge: "신흥 트렌드",
    badgeType: "rapid",
    imageUrl: "",
    rank: 13,
  },
  {
    id: "14",
    name: "서촌 한옥마을",
    district: "서울 종로구",
    category: "카페",
    revenue: "₩22억 3,100만",
    growthRate: 756.2,
    badge: "신흥 트렌드",
    badgeType: "rapid",
    imageUrl: "",
    rank: 14,
  },
  {
    id: "15",
    name: "경리단길",
    district: "서울 용산구",
    category: "레스토랑",
    revenue: "₩31억 5,800만",
    growthRate: 892.1,
    badge: "신흥 트렌드",
    badgeType: "explosive",
    imageUrl: "",
    rank: 15,
  },
  {
    id: "16",
    name: "익선동 한옥거리",
    district: "서울 종로구",
    category: "카페",
    revenue: "₩18억 9,200만",
    growthRate: 645.3,
    badge: "신흥 트렌드",
    badgeType: "rapid",
    imageUrl: "",
    rank: 16,
  },
  {
    id: "17",
    name: "해방촌",
    district: "서울 용산구",
    category: "카페",
    revenue: "₩14억 7,600만",
    growthRate: 587.4,
    badge: "신흥 트렌드",
    badgeType: "rapid",
    imageUrl: "",
    rank: 17,
  },
  {
    id: "18",
    name: "성내동 먹자골목",
    district: "서울 강동구",
    category: "식당",
    revenue: "₩25억 3,400만",
    growthRate: 712.8,
    badge: "신흥 트렌드",
    badgeType: "rapid",
    imageUrl: "",
    rank: 18,
  },
];

interface LocationListPageProps {
  onSelectLocation: (location: Location) => void;
}

export function LocationListPage({ onSelectLocation }: LocationListPageProps) {
  const [placeholderIndex, setPlaceholderIndex] = useState(0);

  const placeholders = [
    "감성 카페 차리기 좋은 곳",
    "청년이 많이 찾는 곳",
    "유동인구가 급증하는 상권",
    "임대료 대비 수익률 높은 지역",
    "직장인 점심 수요가 많은 곳",
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderIndex((prev) => (prev + 1) % placeholders.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col min-h-full">
      <div className="px-8 pt-4 pb-4">
        <div className="bg-white rounded-3xl shadow-sm p-10 mb-8 border border-gray-100">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-slate-900 mb-2">안녕하세요, 사장님</h1>
            <p className="text-xl text-slate-400 font-medium">오늘은 어떤 상권을 찾고 계신가요?</p>
          </div>

          <div className="relative max-w-2xl">
            <div className="absolute left-6 top-1/2 -translate-y-1/2 z-10">
              <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center">
                <Search className="w-3.5 h-3.5 text-slate-500" />
              </div>
            </div>
            <div className="absolute left-16 top-1/2 -translate-y-1/2 pointer-events-none h-6 overflow-hidden">
              <AnimatePresence mode="wait">
                <motion.div
                  key={placeholderIndex}
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -20, opacity: 0 }}
                  transition={{ duration: 0.5, ease: "easeInOut" }}
                  className="text-base text-slate-400 font-medium"
                >
                  {placeholders[placeholderIndex]}
                </motion.div>
              </AnimatePresence>
            </div>
            <input
              type="text"
              className="w-full pl-16 pr-6 py-4 bg-slate-50 border border-slate-200 rounded-full text-base text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
          </div>
        </div>
      </div>

      <div className="px-8 pb-8">
        <div className="space-y-12 pb-12">
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-blue-600" />
                지금 가장 뜨거운 상권 TOP 4
              </h2>
            </div>
            <div
              className="flex overflow-x-auto gap-6 pb-6 -mx-4 px-4 no-scrollbar"
              style={{ msOverflowStyle: "none", scrollbarWidth: "none" }}
            >
              <style>{`
                .no-scrollbar::-webkit-scrollbar {
                  display: none;
                }
              `}</style>
              {hotLocations.map((loc) => (
                <div key={loc.id} className="w-[320px] flex-shrink-0">
                  <LocationSuggestionCard location={loc} onSelect={onSelectLocation} />
                </div>
              ))}
            </div>
          </section>

          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                <TrendingUp className="w-6 h-6 text-orange-500" />
                급상승 중인 신흥 트렌드 상권
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {trendingLocations.slice(0, 4).map((loc) => (
                <LocationSuggestionCard key={loc.id} location={loc} onSelect={onSelectLocation} />
              ))}
            </div>
          </section>

          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                <Clock className="w-6 h-6 text-green-600" />
                꾸준한 수익, 안정형 상권
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {stableLocations.slice(0, 4).map((loc) => (
                <LocationSuggestionCard key={loc.id} location={loc} onSelect={onSelectLocation} />
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

function LocationSuggestionCard({
  location,
  onSelect,
}: {
  location: Location;
  onSelect: (location: Location) => void;
}) {
  return (
    <button
      onClick={() => onSelect(location)}
      className="group bg-white rounded-3xl p-6 text-left hover:shadow-xl transition-all border border-slate-100 hover:border-blue-900/20 flex flex-col h-[380px] w-full"
    >
      <div className="relative w-full h-40 bg-slate-50 rounded-2xl overflow-hidden mb-5">
        <ImageWithFallback
          src={`https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=800&auto=format&fit=crop&sig=${location.id}`}
          alt={location.name}
          className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-500"
        />
        <div
          className={`absolute top-3 left-3 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider shadow-sm ${
            location.badgeType === "explosive"
              ? "bg-orange-500 text-white"
              : location.badgeType === "rapid"
              ? "bg-blue-600 text-white"
              : "bg-emerald-500 text-white"
          }`}
        >
          {location.badge}
        </div>
      </div>

      <div className="flex-1 flex flex-col justify-between">
        <div>
          <h4 className="text-xl font-black text-slate-900 mb-1 line-clamp-1">{location.name}</h4>
          <p className="text-xs font-bold text-slate-400 mb-4">{location.district}</p>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-slate-50">
          <div className="space-y-0.5">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">월 매출액</p>
            <p className="text-sm font-black text-blue-950">{location.revenue}</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">성장률</p>
            <p className="text-sm font-black text-emerald-600">+{location.growthRate}%</p>
          </div>
        </div>
      </div>
    </button>
  );
}
