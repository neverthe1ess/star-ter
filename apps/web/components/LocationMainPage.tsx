'use client';

import { RecommendSection } from '@/components/location-main-page/RecommendSection';
import { TrendingSection } from '@/components/location-main-page/TrendingSection';
import { AverageSalesSection } from '@/components/location-main-page/AverageSalesSection';

import { useUserStore } from '@/store/use-user-store';

export function LocationListPage() {
  const { authUser } = useUserStore();

  return (
    <div className="flex flex-1 overflow-y-auto flex-col h-full bg-white rounded-2xl shadow-lg overflow-hidden no-scrollbar">
      {/* 인사말 헤더 + 검색 */}
      <div className="px-8 pt-6 pb-4 shrink-0">
        <h1 className="text-3xl font-bold text-slate-900 mb-1">
          안녕하세요, {authUser?.nickname ? `${authUser.nickname}님` : '사장님'}
        </h1>
        <p className="text-base text-slate-400 mb-6">
          오늘은 어떤 상권을 찾고 계신가요?
        </p>
      </div>

      {/* 섹션들 */}
      <RecommendSection />
      <AverageSalesSection />
      <TrendingSection />
    </div>
  );
}
