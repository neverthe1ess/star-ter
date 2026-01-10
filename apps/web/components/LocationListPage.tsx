'use client';

import { Clock, LogIn, Search, Sparkles, TrendingUp } from 'lucide-react';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Link from 'next/link';
import {
  getGrowthRanking,
  getStableLocations,
  mapRankingToLocation,
  LocationUI,
} from '@/services/location/locationListPage.service';
import {
  getRecommendations,
  ScoredLocation,
} from '@/services/location/locationRecommend.service';
import { getOnboarding } from '@/services/user/user.api';

export function LocationListPage() {
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [trendingLocationsData, setTrendingLocationsData] = useState<
    LocationUI[]
  >([]);
  const [stableLocationsData, setStableLocationsData] = useState<LocationUI[]>(
    [],
  );
  const [recommendedLocations, setRecommendedLocations] = useState<
    ScoredLocation[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isStableLoading, setIsStableLoading] = useState(true);
  const [isRecommendLoading, setIsRecommendLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [onboardingCompleted, setOnboardingCompleted] = useState(false);

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

  // 맞춤 추천 데이터 로드 (로그인 체크 포함)
  useEffect(() => {
    async function fetchRecommendations() {
      try {
        // 온보딩 데이터 조회 (로그인 체크 겸용)
        const onboarding = await getOnboarding();

        if (!onboarding) {
          // 로그인 안됨
          setIsLoggedIn(false);
          setIsRecommendLoading(false);
          return;
        }

        setIsLoggedIn(true);
        setOnboardingCompleted(onboarding.completed);

        if (
          !onboarding.completed ||
          !onboarding.age ||
          !onboarding.region ||
          !onboarding.operatingTime ||
          !onboarding.capital
        ) {
          // 온보딩 미완료
          setIsRecommendLoading(false);
          return;
        }

        // 추천 API 호출
        const response = await getRecommendations({
          age: onboarding.age,
          region: onboarding.region,
          operatingTime: onboarding.operatingTime,
          capital: onboarding.capital,
        });

        if (response) {
          setRecommendedLocations(response.locations.slice(0, 6));
        }
      } catch (error) {
        console.error('Failed to fetch recommendations:', error);
      } finally {
        setIsRecommendLoading(false);
      }
    }
    fetchRecommendations();
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

  // 맞춤 추천 섹션 렌더링
  const renderRecommendSection = () => {
    if (isRecommendLoading) {
      return (
        <div className="flex overflow-x-auto gap-6 pb-6 -mx-4 px-4 no-scrollbar">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="w-100 shrink-0 bg-white rounded-3xl p-6 border border-slate-100 h-48 animate-pulse"
            >
              <div className="h-6 bg-slate-100 rounded w-3/4 mb-2" />
              <div className="h-4 bg-slate-100 rounded w-1/2" />
            </div>
          ))}
        </div>
      );
    }

    if (!isLoggedIn) {
      return (
        <div className="bg-linear-to-r from-blue-50 to-indigo-50 rounded-3xl p-8 border border-blue-100">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
              <LogIn className="w-6 h-6 text-blue-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-slate-900 mb-1">
                로그인하고 맞춤 추천 받기
              </h3>
              <p className="text-sm text-slate-500">
                나만의 조건에 맞는 상권을 AI가 분석해드려요
              </p>
            </div>
            <Link
              href="/login"
              className="px-6 py-3 bg-blue-600 text-white rounded-full font-bold text-sm hover:bg-blue-700 transition-colors"
            >
              로그인
            </Link>
          </div>
        </div>
      );
    }

    if (!onboardingCompleted) {
      return (
        <div className="bg-linear-to-r from-amber-50 to-orange-50 rounded-3xl p-8 border border-amber-100">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-amber-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-slate-900 mb-1">
                온보딩을 완료해주세요
              </h3>
              <p className="text-sm text-slate-500">
                연령대, 선호 지역, 운영 시간, 창업 자본금을 설정하면 맞춤 추천을
                받을 수 있어요
              </p>
            </div>
            <Link
              href="/onboarding"
              className="px-6 py-3 bg-amber-500 text-white rounded-full font-bold text-sm hover:bg-amber-600 transition-colors"
            >
              온보딩 시작
            </Link>
          </div>
        </div>
      );
    }

    return (
      <div
        className="flex overflow-x-auto gap-6 pb-6 -mx-4 px-4 no-scrollbar"
        style={{ msOverflowStyle: 'none', scrollbarWidth: 'none' }}
      >
        {recommendedLocations.map((loc) => (
          <div key={loc.id} className="w-100 shrink-0">
            <RecommendationCard location={loc} />
          </div>
        ))}
      </div>
    );
  };

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
            <style>{`
              .no-scrollbar::-webkit-scrollbar {
                display: none;
              }
            `}</style>
            {renderRecommendSection()}
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
                      <LocationSuggestionCard key={loc.id} location={loc} />
                    </div>
                  ))}
            </div>
          </section>

          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                <Clock className="w-6 h-6 text-slate-600" />
                꾸준히 수익 내는 안정형 상권
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
                      <LocationSuggestionCard key={loc.id} location={loc} />
                    </div>
                  ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

// 맞춤 추천 카드 컴포넌트
function RecommendationCard({ location }: { location: ScoredLocation }) {
  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-emerald-600';
    if (score >= 70) return 'text-blue-600';
    if (score >= 50) return 'text-amber-600';
    return 'text-slate-500';
  };

  const getScoreBadge = (score: number) => {
    if (score >= 90) return { text: '최적 매칭', color: 'bg-emerald-500' };
    if (score >= 70) return { text: '추천', color: 'bg-blue-500' };
    if (score >= 50) return { text: '적합', color: 'bg-amber-500' };
    return { text: '참고', color: 'bg-slate-400' };
  };

  const badge = getScoreBadge(location.totalScore);

  return (
    <Link
      href={`/locations/detail/${location.id}`}
      className="group bg-white rounded-3xl p-6 text-left hover:shadow-xl transition-all border border-slate-100 hover:border-blue-900/20 flex flex-col h-auto w-full block"
    >
      {/* 배지 */}
      <div className="mb-4">
        <span
          className={`inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider shadow-sm text-white ${badge.color}`}
        >
          {badge.text}
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
              매칭 점수
            </p>
            <p
              className={`text-2xl font-black ${getScoreColor(location.totalScore)}`}
            >
              {location.totalScore}점
            </p>
          </div>
          <div className="text-right space-y-1">
            <div className="flex gap-2 text-[10px]">
              <span className="text-slate-400">연령</span>
              <span className="font-bold text-slate-600">
                {Math.round(location.scores.age * 100)}%
              </span>
            </div>
            <div className="flex gap-2 text-[10px]">
              <span className="text-slate-400">임대료</span>
              <span className="font-bold text-slate-600">
                {Math.round(location.scores.rent * 100)}%
              </span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

// 기존 카드 컴포넌트 (트렌드/안정형 상권용)
function LocationSuggestionCard({ location }: { location: LocationUI }) {
  return (
    <Link
      href={`/locations/detail/${location.id}`}
      className="group bg-white rounded-3xl p-6 text-left hover:shadow-xl transition-all border border-slate-100 hover:border-blue-900/20 flex flex-col h-auto w-full block"
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
    </Link>
  );
}
