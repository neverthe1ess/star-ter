'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  getRecommendations,
  ScoredLocation,
} from '@/services/location/locationRecommend.service';
import { getOnboarding } from '@/services/user/user.api';
import { useUserStore } from '@/store/use-user-store';
import { PentagonChart } from '@/components/charts/PentagonChart';

type DisplayLocation = {
  id: string;
  name: string;
  region: string;
  score: number;
  metrics: { label: string; value: number }[];
  href: string;
};

const formatScore = (score: number) =>
  Number.isInteger(score) ? `${score}` : score.toFixed(1);

const getScoreBadge = (score: number) => {
  if (score >= 90)
    return {
      text: '최적 매칭',
      badgeColor: 'bg-emerald-500',
      textColor: 'text-emerald-500',
    };
  if (score >= 70)
    return {
      text: '추천',
      badgeColor: 'bg-blue-500',
      textColor: 'text-blue-500',
    };
  if (score >= 50)
    return {
      text: '적합',
      badgeColor: 'bg-amber-500',
      textColor: 'text-amber-500',
    };
  return {
    text: '참고',
    badgeColor: 'bg-slate-400',
    textColor: 'text-slate-400',
  };
};

export function RecommendSection() {
  const authUser = useUserStore((state) => state.authUser);
  const [recommendedLocations, setRecommendedLocations] = useState<
    ScoredLocation[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!authUser) {
      setRecommendedLocations([]);
      setIsLoading(false);
      return;
    }

    async function fetchRecommendations() {
      setIsLoading(true);
      try {
        const onboarding = await getOnboarding();
        if (!onboarding || !onboarding.completed) return;
        if (
          !onboarding.age ||
          !onboarding.region ||
          !onboarding.operatingTime ||
          !onboarding.capital
        )
          return;

        const response = await getRecommendations({
          age: onboarding.age,
          region: onboarding.region,
          operatingTime: onboarding.operatingTime,
          capital: onboarding.capital,
          industryCode: onboarding.industryCode,
        });

        if (response) {
          setRecommendedLocations(response.locations.slice(0, 5));
        }
      } catch (error) {
        console.error('Failed to fetch recommendations:', error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchRecommendations();
  }, [authUser]);

  const displayLocations: DisplayLocation[] = useMemo(() => {
    if (recommendedLocations.length > 0) {
      return recommendedLocations.map((location) => ({
        id: location.id,
        name: location.name,
        region: '서울',
        score: location.totalScore,
        metrics: [
          { label: '타깃 연령', value: Math.round(location.scores.age * 100) },
          { label: '창업 비용', value: Math.round(location.scores.rent * 100) },
          {
            label: '상권 테마',
            value: Math.round(location.scores.region * 100),
          },
          { label: '운영 시간', value: Math.round(location.scores.time * 100) },
          ...(location.scores.industry !== null
            ? [
                {
                  label: '업종 적합',
                  value: Math.round(location.scores.industry * 100),
                },
              ]
            : []),
        ],
        href: `/locations/detail/${location.id}`,
      }));
    }
    return [];
  }, [recommendedLocations]);

  // 로그인 안됨 or 온보딩 미완료시 표시할 내용
  if (!authUser) {
    return (
      <section className="px-8 py-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-slate-900">
            사장님께 추천하는 상권
          </h2>
          <Link
            href="/locations/search?tab=맞춤 추천"
            className="text-sm font-medium text-slate-400 hover:text-slate-600 transition-colors"
          >
            더보기 &gt;
          </Link>
        </div>
        <div className="bg-linear-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100">
          <p className="text-slate-600">
            로그인하고 온보딩을 완료하면 맞춤 추천을 받을 수 있어요!
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="px-8 py-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-slate-900">
          {authUser?.nickname ? `${authUser.nickname}님` : '사장님'}께 추천하는
          상권
        </h2>
        <Link
          href="/locations/search?tab=맞춤 추천"
          className="text-sm font-medium text-slate-400 hover:text-slate-600 transition-colors"
        >
          더보기 &gt;
        </Link>
      </div>

      <div className="overflow-x-auto pb-4">
        <div className="flex gap-5" style={{ scrollbarWidth: 'none' }}>
          {isLoading || displayLocations.length === 0
            ? Array.from({ length: 5 }).map((_, index) => (
                <div
                  key={`loading-${index}`}
                  className="w-96 shrink-0 rounded-2xl bg-white shadow-sm border border-slate-100 p-6 animate-pulse flex flex-col justify-between h-96"
                >
                  <div className="space-y-3">
                    <div className="h-5 w-16 rounded-full bg-slate-100" />
                    <div className="h-5 w-40 rounded bg-slate-100" />
                    <div className="h-4 w-24 rounded bg-slate-100" />
                  </div>
                  <div className="flex items-end justify-between gap-6">
                    <div>
                      <div className="mb-3 h-3 w-14 rounded bg-slate-100" />
                      <div className="flex items-end gap-2">
                        <div className="h-8 w-16 rounded bg-slate-100" />
                        <div className="h-4 w-6 rounded bg-slate-100" />
                      </div>
                    </div>
                    <div className="h-40 w-40 rounded-full bg-slate-100" />
                  </div>
                </div>
              ))
            : displayLocations.map((location) => {
                const badge = getScoreBadge(location.score);
                return (
                  <Link
                    key={location.id}
                    href={location.href}
                    className="w-96 shrink-0 rounded-2xl bg-white shadow-sm border border-slate-100 p-6 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg flex flex-col justify-between h-96"
                  >
                    <div className="space-y-1.5">
                      <div
                        className={`inline-flex items-center rounded-full px-3 py-1 text-[10px] font-bold text-white ${badge.badgeColor}`}
                      >
                        {badge.text}
                      </div>
                      <h3 className="mt-2 text-xl font-bold text-slate-900">
                        {location.name}
                      </h3>
                      <p className="text-sm font-semibold text-slate-400">
                        {location.region}
                      </p>
                    </div>

                    <div className="flex items-end justify-between gap-6">
                      <div>
                        <p className="text-sm font-semibold text-slate-400 mb-2">
                          매칭 점수
                        </p>
                        <div className="flex items-end gap-1">
                          <span
                            className={`text-4xl font-black ${badge.textColor}`}
                          >
                            {formatScore(location.score)}
                          </span>
                          <span
                            className={`text-sm font-bold ${badge.textColor}`}
                          >
                            점
                          </span>
                        </div>
                      </div>

                      <div className="relative right-6">
                        <PentagonChart metrics={location.metrics} size={200} />
                      </div>
                    </div>
                  </Link>
                );
              })}
        </div>
      </div>
    </section>
  );
}
