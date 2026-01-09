'use client';

import { Clock, Search, Sparkles, TrendingUp } from 'lucide-react';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  getGrowthRanking,
  getStableLocations,
  mapRankingToLocation,
  LocationUI,
} from '@/services/location/locationListPage.service';

// 사용자 맞춤 상권용 MockData
const hotLocations: LocationUI[] = [
  {
    id: '1',
    name: '성수동 카페거리',
    revenue: '₩315억 9,840만',
    growthRate: 2623.5,
    badge: '폭발 성장',
    badgeType: 'explosive',
    rank: 1,
  },
  {
    id: '2',
    name: '연남동 골목상권',
    revenue: '₩66억 5,025만',
    growthRate: 999.5,
    badge: '폭발 성장',
    badgeType: 'explosive',
    rank: 2,
  },
  {
    id: '3',
    name: '강남역 상권',
    revenue: '₩88억 6,519만',
    growthRate: 694.8,
    badge: '급성장',
    badgeType: 'rapid',
    rank: 3,
  },
  {
    id: '4',
    name: '을지로 레트로',
    revenue: '₩93억 3,420만',
    growthRate: 680.4,
    badge: '급성장',
    badgeType: 'rapid',
    rank: 4,
  },
  {
    id: '5',
    name: '을지로 2',
    revenue: '₩90억 3,420만',
    growthRate: 6.4,
    badge: '급성장',
    badgeType: 'rapid',
    rank: 4,
  },
  {
    id: '6',
    name: '을지로 3',
    revenue: '₩90억 3,420만',
    growthRate: 6.4,
    badge: '급성장',
    badgeType: 'rapid',
    rank: 4,
  },
];

interface LocationListPageProps {
  onSelectLocation: (location: LocationUI) => void;
}

export function LocationListPage({ onSelectLocation }: LocationListPageProps) {
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [trendingLocationsData, setTrendingLocationsData] = useState<
    LocationUI[]
  >([]);
  const [stableLocationsData, setStableLocationsData] = useState<LocationUI[]>(
    [],
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isStableLoading, setIsStableLoading] = useState(true);

  const placeholders = [
    '감성 카페 차리기 좋은 곳',
    '청년이 많이 찾는 곳',
    '유동인구가 급증하는 상권',
    '임대료 대비 수익률 높은 지역',
    '직장인 점심 수요가 많은 곳',
  ];
  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderIndex((prev) => (prev + 1) % placeholders.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // 급상승 트렌드 상권 데이터 로드
  useEffect(() => {
    async function fetchTrendingLocations() {
      try {
        const response = await getGrowthRanking();
        const mapped = response.items
          .slice(0, 4)
          .map((item, index) => mapRankingToLocation(item, index));
        setTrendingLocationsData(mapped);
      } catch (error) {
        console.error('Failed to fetch trending locations:', error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchTrendingLocations();
  }, []);

  // 안정형 상권 데이터 로드
  useEffect(() => {
    async function fetchStableLocations() {
      try {
        const items = await getStableLocations(4);
        const mapped = items.map((item, index) =>
          mapRankingToLocation(item, index),
        );
        setStableLocationsData(mapped);
      } catch (error) {
        console.error('Failed to fetch stable locations:', error);
      } finally {
        setIsStableLoading(false);
      }
    }
    fetchStableLocations();
  }, []);

  return (
    <div className="flex flex-col min-h-full">
      <div className="px-8 pt-4 pb-4">
        <div className="bg-white rounded-3xl shadow-sm p-10 mb-8 border border-gray-100">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-slate-900 mb-2">
              안녕하세요, 사장님
            </h1>
            <p className="text-xl text-slate-400 font-medium">
              오늘은 어떤 상권을 찾고 계신가요?
            </p>
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
                  transition={{ duration: 0.5, ease: 'easeInOut' }}
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

      <div className="px-5 pb-8">
        <div className="space-y-12 pb-12">
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-blue-600" />
                사용자 맞춤 상권
              </h2>
            </div>
            <div
              className="flex overflow-x-auto gap-6 pb-6 -mx-4 px-4 no-scrollbar"
              style={{ msOverflowStyle: 'none', scrollbarWidth: 'none' }}
            >
              <style>{`
                .no-scrollbar::-webkit-scrollbar {
                  display: none;
                }
              `}</style>
              {hotLocations.map((loc) => (
                <div key={loc.id} className="w-100 shrink-0">
                  <LocationSuggestionCard
                    location={loc}
                    onSelect={onSelectLocation}
                  />
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
            <div
              className="flex overflow-x-auto gap-6 pb-6 -mx-4 px-4 no-scrollbar"
              style={{ msOverflowStyle: 'none', scrollbarWidth: 'none' }}
            >
              {isLoading
                ? Array.from({ length: 4 }).map((_, i) => (
                    <div
                      key={i}
                      className="w-100 shrink-0 bg-white rounded-3xl p-6 border border-slate-100 h-48 animate-pulse"
                    >
                      <div className="h-6 bg-slate-100 rounded w-3/4 mb-2" />
                      <div className="h-4 bg-slate-100 rounded w-1/2" />
                    </div>
                  ))
                : trendingLocationsData.map((loc) => (
                    <div key={loc.id} className="w-100 shrink-0">
                      <LocationSuggestionCard
                        location={loc}
                        onSelect={onSelectLocation}
                      />
                    </div>
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
            <div
              className="flex overflow-x-auto gap-6 pb-6 -mx-4 px-4 no-scrollbar"
              style={{ msOverflowStyle: 'none', scrollbarWidth: 'none' }}
            >
              {isStableLoading
                ? Array.from({ length: 4 }).map((_, i) => (
                    <div
                      key={i}
                      className="w-100 shrink-0 bg-white rounded-3xl p-6 border border-slate-100 h-48 animate-pulse"
                    >
                      <div className="h-6 bg-slate-100 rounded w-3/4 mb-2" />
                      <div className="h-4 bg-slate-100 rounded w-1/2" />
                    </div>
                  ))
                : stableLocationsData.map((loc) => (
                    <div key={loc.id} className="w-100 shrink-0">
                      <LocationSuggestionCard
                        location={loc}
                        onSelect={onSelectLocation}
                      />
                    </div>
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
  location: LocationUI;
  onSelect: (location: LocationUI) => void;
}) {
  return (
    <button
      onClick={() => onSelect(location)}
      className="group bg-white rounded-3xl p-6 text-left hover:shadow-xl transition-all border border-slate-100 hover:border-blue-900/20 flex flex-col h-auto w-full"
    >
      {/* 배지 */}
      <div className="mb-4">
        <span
          className={`inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider shadow-sm ${
            location.badgeType === 'explosive'
              ? 'bg-orange-500 text-white'
              : location.badgeType === 'rapid'
                ? 'bg-blue-600 text-white'
                : 'bg-emerald-500 text-white'
          }`}
        >
          {location.badge}
        </span>
      </div>

      <div className="flex-1 flex flex-col justify-between">
        <div>
          <h4 className="text-xl font-black text-slate-900 mb-1 line-clamp-1">
            {location.name}
          </h4>
          <p className="text-xs font-bold text-slate-400 mb-4">서울</p>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-slate-50">
          <div className="space-y-0.5">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">
              월 매출액
            </p>
            <p className="text-sm font-black text-blue-950">
              {location.revenue}
            </p>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">
              성장률
            </p>
            <p className="text-sm font-black text-emerald-600">
              +{location.growthRate}%
            </p>
          </div>
        </div>
      </div>
    </button>
  );
}
