'use client';

import React, { useMemo } from 'react';
import { RankingItem } from './mock-data';
import RankNavItem from '../rank-nav/RankNavItem';
import { useRevenueRanking, RankItem } from '@/hooks/useRevenueRanking';
import { IndustryData } from '../../mocks/industry';

interface RankingListProps {
  onSelect: (item: RankingItem) => void;
  activeTab: 'REGION' | 'INDUSTRY';
}

export default function RankingList({ onSelect, activeTab }: RankingListProps) {
  const [viewType, setViewType] = React.useState<'GU' | 'DONG'>('GU');
  const [selectedGuId, setSelectedGuId] = React.useState<string | null>(null);
  const [visibleCount, setVisibleCount] = React.useState(10);

  // Industry Selection State
  const [selectedCategoryCode, setSelectedCategoryCode] =
    React.useState<string>('I2'); // Default: Food
  const [selectedIndustryCode, setSelectedIndustryCode] = React.useState<
    string | null
  >(null);

  // Get current category sub-items
  const currentCategory = useMemo(
    () => IndustryData.find((c) => c.code === selectedCategoryCode),
    [selectedCategoryCode],
  );

  // Use the hook to fetch real data
  const { items, isLoading, error, handleSelect } = useRevenueRanking({
    level: viewType === 'GU' ? 'gu' : 'dong',
    parentGuCode: selectedGuId || undefined,
    industryCode:
      activeTab === 'INDUSTRY' ? selectedIndustryCode || undefined : undefined,
    industryCodes:
      activeTab === 'INDUSTRY' &&
      !selectedIndustryCode &&
      currentCategory?.children
        ? currentCategory.children.map((c) => c.code).join(',')
        : undefined,
  });

  // Fetch Gu list for the dropdown
  const { items: guList } = useRevenueRanking({ level: 'gu' });

  // Get current category sub-items

  const handleItemClick = async (item: RankItem) => {
    // Map API item to RankingItem format for DetailPanel
    // Since API item is missing some fields, we mock/derive them
    const rankingItem: RankingItem = {
      id: item.code,
      rank: 0, // Assigned below or not needed for detail? Detail uses rank?
      name: item.name,
      category: '상권', // Default
      revenue: item.amount,
      fluctuation: getFluctuationFromChangeType(item.changeType),
      volume: 0, // Not available in API currently
      stores: item.count,
      isFavorite: false,
      code: item.code,
    };

    // Always select item for detail view, no drill-down
    onSelect(rankingItem);
    await handleSelect(item.name);
  };

  const handleViewTypeChange = (type: 'GU' | 'DONG') => {
    setViewType(type);
    if (type === 'GU') {
      setSelectedGuId(null);
    } else {
      setSelectedGuId('11140'); // Default to Jung-gu
    }
    setVisibleCount(10);
  };

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

  return (
    <div className="flex flex-col bg-white h-full">
      {/* Header / Toggle */}
      <div className="px-6 py-4 border-b border-gray-100 flex flex-col gap-3">
        {/* Tab-specific Controls */}
        {activeTab === 'INDUSTRY' && (
          <div className="flex flex-col gap-2 mb-2">
            <div className="flex gap-2">
              <select
                className="flex-1 text-sm border border-gray-200 rounded-lg px-2 py-1.5 outline-none focus:border-blue-500 bg-gray-50"
                value={selectedCategoryCode}
                onChange={(e) => {
                  setSelectedCategoryCode(e.target.value);
                  setSelectedIndustryCode(null);
                }}
              >
                {IndustryData.map((cat) => (
                  <option key={cat.code} value={cat.code}>
                    {cat.name}
                  </option>
                ))}
              </select>
              <select
                className="flex-1 text-sm border border-gray-200 rounded-lg px-2 py-1.5 outline-none focus:border-blue-500 bg-gray-50"
                value={selectedIndustryCode || ''}
                onChange={(e) =>
                  setSelectedIndustryCode(e.target.value || null)
                }
              >
                <option value="">전체 업종</option>
                {currentCategory?.children?.map((sub) => (
                  <option key={sub.code} value={sub.code}>
                    {sub.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-lg">
            <button
              onClick={() => handleViewTypeChange('GU')}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                viewType === 'GU'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              구 단위
            </button>
            <button
              onClick={() => handleViewTypeChange('DONG')}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                viewType === 'DONG'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              동 단위
            </button>
          </div>
        </div>

        {/* Gu Selector (Visible only in Dong view) */}
        {viewType === 'DONG' && (
          <select
            className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-blue-500 bg-gray-50"
            value={selectedGuId || ''}
            onChange={(e) => {
              setSelectedGuId(e.target.value || null);
              setVisibleCount(10);
            }}
          >
            {/* <option value="">전체 지역 (서울시)</option> */}
            {guList.map((gu) => (
              <option key={gu.code} value={gu.code}>
                {gu.name}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* List Items */}
      <div className="flex-1 overflow-y-auto w-full p-4 space-y-2">
        {isLoading ? (
          <div className="space-y-2">
            {[...Array(10)].map((_, i) => (
              <div
                key={i}
                className="flex w-full h-14 items-center gap-3 rounded-xl border border-transparent px-3 py-2"
              >
                <div className="h-5 w-5 rounded-full bg-gray-200 animate-pulse" />
                <div className="flex flex-1 items-center justify-between gap-4">
                  <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
                  <div className="h-4 w-16 bg-gray-200 rounded animate-pulse" />
                </div>
                <div className="h-5 w-12 bg-gray-200 rounded-full animate-pulse" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-10 text-red-500 text-sm">{error}</div>
        ) : items.length > 0 ? (
          <>
            {items.slice(0, visibleCount).map((item, index) => (
              <RankNavItem
                key={item.code}
                item={item}
                rank={index + 1}
                onClick={() => handleItemClick(item)}
                disabled={false}
                formatAmount={(val) =>
                  `${(val / 100000000).toLocaleString(undefined, {
                    minimumFractionDigits: 1,
                    maximumFractionDigits: 1,
                  })}억원`
                }
              />
            ))}
            {items.length > visibleCount && (
              <button
                onClick={() => setVisibleCount((prev) => prev + 10)}
                className="w-full py-3 text-sm font-medium text-gray-500 hover:bg-gray-50 rounded-lg transition-colors"
              >
                더보기 ({(items.length - visibleCount).toLocaleString()}개 남음)
              </button>
            )}
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
