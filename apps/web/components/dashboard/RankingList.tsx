'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { RankingItem } from './mock-data';
import RankNavItem from '../rank-nav/RankNavItem';
import {
  useThemeRanking,
  ThemeType,
  ThemeValue,
  AdminLevel,
} from '@/hooks/useThemeRanking';
import { RankItem } from '@/hooks/useRevenueRanking';

interface RankingListProps {
  onSelect: (item: RankingItem) => void;
  onHover?: (item: RankingItem | null) => void; // Hover 시 부모에게 알림
  themeType: ThemeType;
  themeValue: ThemeValue;
  ageGroup?: string;
  timeSlot?: string;
  adminLevel?: AdminLevel;
}

// Helper to estimate fluctuation from changeType label
const getFluctuationFromChangeType = (changeType?: string): number => {
  switch (changeType) {
    case 'LH':
      return 12.5; // High Growth
    case 'LL':
      return 3.2; // Dynamic
    case 'HL':
      return -5.4; // Risk
    case 'HH':
      return 0.5; // Stagnant
    default:
      return 0;
  }
};

export default function RankingList({
  onSelect,
  onHover,
  themeType,
  themeValue,
  ageGroup,
  timeSlot,
  adminLevel = 'commercial',
}: RankingListProps) {
  const router = useRouter();
  // Favorites State
  const [favorites, setFavorites] = React.useState<Set<string>>(new Set());
  const [hoveredItem, setHoveredItem] = useState<RankItem | null>(null);
  const [visibleCount, setVisibleCount] = React.useState(10);

  const toggleFavorite = (e: React.MouseEvent, code: string) => {
    e.stopPropagation();
    setFavorites((prev) => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(code)) {
        newFavorites.delete(code);
      } else {
        newFavorites.add(code);
      }
      return newFavorites;
    });
  };

  // RankItem -> RankingItem 변환 헬퍼 함수
  const toRankingItem = (item: RankItem, rank: number): RankingItem => ({
    id: item.code,
    rank,
    name: item.name,
    category: '상권',
    revenue: item.amount,
    fluctuation:
      item.fluctuationRate ?? getFluctuationFromChangeType(item.changeType),
    volume: 0,
    stores: item.count,
    isFavorite: favorites.has(item.code),
    code: item.code,
    metricType: themeType === 'POPULATION' ? 'POPULATION' : 'REVENUE',
  });

  // Use Theme Ranking Hook
  const { items, isLoading, handleSelect } = useThemeRanking({
    themeType,
    themeValue,
    ageGroup,
    timeSlot,
    adminLevel,
  });

  // 리스트 로드 시 첫 번째 아이템을 기본으로 표시
  React.useEffect(() => {
    if (items.length > 0 && !hoveredItem) {
      onHover?.(toRankingItem(items[0], 1));
    }
  }, [items]);

  // Hover 디바운스 처리 (800ms)
  React.useEffect(() => {
    if (hoveredItem) {
      const timer = setTimeout(() => {
        const index = items.findIndex((i) => i.code === hoveredItem.code);
        if (index !== -1) {
          onHover?.(toRankingItem(hoveredItem, index + 1));
        }
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [hoveredItem, items, favorites, themeType]);

  const handleItemClick = async (item: RankItem) => {
    if (adminLevel === 'gu') return;

    onSelect(toRankingItem(item, 0));
    await handleSelect(item.name, item.code, adminLevel);
    router.push('/analysis');
  };

  // 테마별 표시 라벨
  const getMetricLabel = () => {
    switch (themeType) {
      case 'MZ':
        return '유동인구 (MZ)';
      case 'GENDER':
        return '유동인구 (성별)';
      case 'GROWTH':
        return '매출 (분기)';
      case 'POPULATION':
        return '유동인구 (명)';
      default:
        return '매출 (분기)';
    }
  };

  // 테마별 금액/인구수 포맷팅
  const formatAmount = (val: number) => {
    if (
      themeType === 'POPULATION' ||
      themeType === 'MZ' ||
      themeType === 'GENDER'
    ) {
      return `약 ${val.toLocaleString()}명`;
    }
    return `약 ${(val / 100000000).toLocaleString(undefined, {
      minimumFractionDigits: 1,
      maximumFractionDigits: 1,
    })}억원`;
  };

  // 테마별 등락률 라벨
  const getFluctuationLabel = () => {
    switch (themeType) {
      case 'MZ':
        return 'MZ비중';
      case 'GENDER':
        return '성별비중';
      case 'GROWTH':
        return '성장률';
      default:
        return '등락률';
    }
  };

  return (
    <div className="flex flex-col bg-white h-full">
      {/* List Header */}
      <div className="grid grid-cols-11 gap-4 border-b border-gray-100 px-6 py-3 text-base font-semibold text-gray-500 bg-gray-50/80 rounded-t-xl">
        <div className="col-span-4 pl-12">순위 / 상권명</div>
        <div className="col-span-3 text-right">{getMetricLabel()}</div>
        <div className="col-span-2 text-right">{getFluctuationLabel()}</div>
        <div className="col-span-2 text-right pr-2">상권 상태</div>
      </div>

      {/* List Items */}
      <div className="flex-1 overflow-y-auto w-full p-4 space-y-2">
        {isLoading ? (
          <div className="space-y-2">
            {[...Array(10)].map((_, i) => (
              <div
                key={i}
                className="flex w-full h-16 items-center gap-3 rounded-xl border border-transparent px-3 py-2"
              >
                <div className="h-5 w-5 rounded-full bg-gray-200 animate-pulse" />
                <div className="flex flex-1 items-center justify-between gap-4">
                  <div className="h-5 w-24 bg-gray-200 rounded animate-pulse" />
                  <div className="h-5 w-16 bg-gray-200 rounded animate-pulse" />
                </div>
                <div className="h-5 w-12 bg-gray-200 rounded-full animate-pulse" />
              </div>
            ))}
          </div>
        ) : items.length > 0 ? (
          <>
            {items.slice(0, visibleCount).map((item, index) => (
              <div
                key={item.code}
                onMouseEnter={() => {
                  setHoveredItem(item);
                }}
              >
                <RankNavItem
                  item={item}
                  rank={index + 1}
                  onClick={() => handleItemClick(item)}
                  disabled={adminLevel === 'gu'}
                  isFavorite={favorites.has(item.code)}
                  onToggleFavorite={(e) => toggleFavorite(e, item.code)}
                  fluctuation={
                    item.fluctuationRate ??
                    getFluctuationFromChangeType(item.changeType)
                  }
                  formatAmount={formatAmount}
                />
              </div>
            ))}
            {visibleCount < items.length && (
              <button
                onClick={() =>
                  setVisibleCount((prev) => Math.min(prev + 10, items.length))
                }
                className="w-full py-3 mt-2 text-lg font-medium text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition-all"
              >
                더 보기 ({Math.min(10, items.length - visibleCount)}개 더)
              </button>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <p className="text-gray-500 text-lg font-medium">
              데이터가 없습니다.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
