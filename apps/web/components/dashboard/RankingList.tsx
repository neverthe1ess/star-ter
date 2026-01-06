'use client';

import React from 'react';
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
  themeType,
  themeValue,
  ageGroup,
  timeSlot,
  adminLevel = 'commercial',
}: RankingListProps) {
  const router = useRouter();
  // Favorites State
  const [favorites, setFavorites] = React.useState<Set<string>>(new Set());

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

  // Use Theme Ranking Hook
  const { items, isLoading, handleSelect } = useThemeRanking({
    themeType,
    themeValue,
    ageGroup,
    timeSlot,
    adminLevel,
  });

  // Auto-select first item on load
  const [hasSelected, setHasSelected] = React.useState(false);

  const handleItemClick = async (item: RankItem) => {
    if (adminLevel === 'gu') return;
    // Map API item to RankingItem format for DetailPanel
    const rankingItem: RankingItem = {
      id: item.code,
      rank: 0,
      name: item.name,
      category: '상권',
      revenue: item.amount, // This holds Population Count for Population Theme
      fluctuation:
        item.fluctuationRate ?? getFluctuationFromChangeType(item.changeType),
      volume: 0,
      stores: item.count,
      isFavorite: favorites.has(item.code),
      code: item.code,
      metricType: themeType === 'POPULATION' ? 'POPULATION' : 'REVENUE',
    };

    onSelect(rankingItem);
    // 주소 검색 및 스토어 업데이트 (코드와 레벨 정보 추가 전달)
    await handleSelect(item.name, item.code, adminLevel);

    // 분석 페이지로 이동
    router.push('/analysis');
  };

  const metricLabel =
    themeType === 'POPULATION' ? '유동인구 (명)' : '매출 (분기)';

  return (
    <div className="flex flex-col bg-white h-full">
      {/* List Header */}
      <div className="grid grid-cols-11 gap-4 border-b border-gray-100 px-6 py-3 text-xs font-semibold text-gray-500 bg-gray-50/80 rounded-t-xl">
        <div className="col-span-4 pl-12">순위 / 상권명</div>
        <div className="col-span-3 text-right">{metricLabel}</div>
        <div className="col-span-2 text-right">등락률</div>
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
            {items.slice(0, 10).map((item, index) => (
              <RankNavItem
                key={item.code}
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
                formatAmount={(val) => {
                  if (themeType === 'POPULATION') {
                    return `약 ${val.toLocaleString()}명`;
                  }
                  return `약 ${(val / 100000000).toLocaleString(undefined, {
                    minimumFractionDigits: 1,
                    maximumFractionDigits: 1,
                  })}억원`;
                }}
              />
            ))}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <p className="text-gray-500 text-sm font-medium">
              데이터가 없습니다.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
