'use client';

import React, { useState } from 'react';
import { X, Search, Building2, Loader2, Heart } from 'lucide-react';
import { useMapStore } from '@/stores/useMapStore';
import { useComparisonStore } from '@/stores/useComparisonStore';
import TabChips from '@/components/ui/TabChips';
import { useThemeRanking, ThemeType, ThemeValue, AdminLevel } from '@/hooks/useThemeRanking';
import { RankItem } from '@/hooks/useRevenueRanking';
import { IndustryData } from '@/mocks/industry';

interface ComparisonModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const changeLabelMap: Record<string, string> = {
  HH: '정체 상권',
  LL: '변동 상권',
  HL: '위험 상권',
  LH: '뜨는 상권',
};

export default function ComparisonModal({ isOpen, onClose }: ComparisonModalProps) {
  const { selectedArea } = useMapStore();
  const { openComparison } = useComparisonStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [isSelecting, setIsSelecting] = useState(false);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  // 탭 상태 (DashboardLayout과 동일)
  const [activeTab, setActiveTab] = useState<ThemeType>('GROWTH');
  const [selectedCategory, setSelectedCategory] = useState<string>('I2');
  const [themeValue, setThemeValue] = useState<ThemeValue>('CS100001');
  const [ageGroup, setAgeGroup] = useState<string>('total');
  const [timeSlot, setTimeSlot] = useState<string>('total');

  // 대분류 옵션
  const CATEGORY_OPTIONS = IndustryData.map((c) => ({
    label: c.name,
    value: c.code,
  }));

  // 소분류 옵션
  const SUB_CATEGORY_OPTIONS = React.useMemo(() => {
    const category = IndustryData.find((c) => c.code === selectedCategory);
    return (
      category?.children?.map((child) => ({
        label: child.name,
        value: child.code,
      })) || []
    );
  }, [selectedCategory]);

  const handleCategoryChange = (categoryCode: string) => {
    setSelectedCategory(categoryCode);
    const category = IndustryData.find((c) => c.code === categoryCode);
    if (category?.children?.length) {
      setThemeValue(category.children[0].code as ThemeValue);
    }
  };

  const AGE_OPTIONS = [
    { label: '전체 연령', value: 'total' },
    { label: '10대', value: '10' },
    { label: '20대', value: '20' },
    { label: '30대', value: '30' },
    { label: '40대', value: '40' },
    { label: '50대', value: '50' },
    { label: '60대 이상', value: '60' },
  ];

  const TIME_OPTIONS = [
    { label: '전체', value: 'total' },
    { label: '새벽', value: '00' },
    { label: '오전', value: '06' },
    { label: '점심', value: '11' },
    { label: '오후', value: '14' },
    { label: '저녁', value: '17' },
    { label: '야간', value: '21' },
  ];

  const handleTabChange = (tab: ThemeType) => {
    setActiveTab(tab);
    if (tab === 'GENDER') {
      setThemeValue('female');
    } else if (tab === 'INDUSTRY') {
      const category = IndustryData.find((c) => c.code === selectedCategory);
      if (category?.children?.length) {
        setThemeValue(category.children[0].code as ThemeValue);
      }
    }
  };

  // useThemeRanking 훅 사용
  const { items, isLoading } = useThemeRanking({
    themeType: activeTab,
    themeValue,
    ageGroup,
    timeSlot,
    adminLevel: 'commercial' as AdminLevel,
  });

  const formatAmount = (val: number) => {
    if (activeTab === 'POPULATION' || activeTab === 'MZ' || activeTab === 'GENDER') {
      return `약 ${val.toLocaleString()}명`;
    }
    return `약 ${(val / 100000000).toLocaleString(undefined, {
      minimumFractionDigits: 1,
      maximumFractionDigits: 1,
    })}억원`;
  };

  const getMetricLabel = () => {
    switch (activeTab) {
      case 'MZ': return '유동인구 (MZ)';
      case 'GENDER': return '유동인구 (성별)';
      case 'GROWTH': return '매출 (분기)';
      case 'POPULATION': return '유동인구 (명)';
      default: return '매출 (분기)';
    }
  };

  const getFluctuationLabel = () => {
    switch (activeTab) {
      case 'MZ': return 'MZ비중';
      case 'GENDER': return '성별비중';
      case 'GROWTH': return '성장률';
      default: return '등락률';
    }
  };

  const filteredItems = items.filter(
    (item) =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
      item.code !== selectedArea?.code
  );

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

  const handleSelectComparison = async (item: RankItem) => {
    if (!selectedArea || isSelecting) return;

    setIsSelecting(true);

    try {
      const dataA = {
        title: selectedArea.name,
        address: selectedArea.name,
        estimatedSales: '조회 중...',
        salesChange: '0%',
        storeCount: '0',
        regionCode: selectedArea.code,
      };

      const fluctuation = item.fluctuationRate ?? 0;
      const dataB = {
        title: item.name,
        address: item.name,
        estimatedSales: formatAmount(item.amount),
        salesChange: fluctuation ? `${fluctuation > 0 ? '+' : ''}${fluctuation.toFixed(1)}%` : '0%',
        storeCount: item.count.toString(),
        regionCode: item.code,
      };

      openComparison(dataA, dataB);
      onClose();
    } finally {
      setIsSelecting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* 백드롭 */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />

      {/* 모달 */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl mx-4 max-h-[85vh] flex flex-col animate-in zoom-in-95 duration-200">
        {/* 헤더 */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">상권 비교</h2>
            <p className="text-lg text-gray-500 mt-0.5">
              {selectedArea?.name ? (
                <>
                  <span className="font-medium text-blue-600">{selectedArea.name}</span>
                  과 비교할 상권을 선택하세요
                </>
              ) : (
                '먼저 비교 기준 상권을 선택해주세요'
              )}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* 탭 선택 (DashboardLayout 스타일) */}
        <div className="flex items-center gap-4 px-4 py-3 border-b border-gray-100">
          <TabChips
            value={activeTab}
            onChange={handleTabChange}
            options={[
              { label: '성장상권', value: 'GROWTH' as ThemeType },
              { label: '유동인구', value: 'POPULATION' as ThemeType },
              { label: '업종별', value: 'INDUSTRY' as ThemeType },
              { label: '성별', value: 'GENDER' as ThemeType },
              { label: 'MZ핫플', value: 'MZ' as ThemeType },
            ]}
            variant="primary"
          />
        </div>

        {/* 하위 필터 */}
        {activeTab === 'POPULATION' && (
          <>
            <div className="px-4 py-2 border-b border-gray-50">
              <TabChips
                value={ageGroup}
                onChange={setAgeGroup}
                options={AGE_OPTIONS}
                variant="secondary"
              />
            </div>
            <div className="px-4 py-2 bg-gray-50/50">
              <TabChips
                value={timeSlot}
                onChange={setTimeSlot}
                options={TIME_OPTIONS}
                variant="secondary"
              />
            </div>
          </>
        )}

        {activeTab === 'INDUSTRY' && (
          <>
            <div className="px-4 py-2 border-b border-gray-50">
              <TabChips
                value={selectedCategory}
                onChange={handleCategoryChange}
                options={CATEGORY_OPTIONS}
                variant="secondary"
              />
            </div>
            {SUB_CATEGORY_OPTIONS.length > 0 && (
              <div className="px-4 py-2 bg-gray-50/50">
                <TabChips
                  value={themeValue}
                  onChange={(v) => setThemeValue(v as ThemeValue)}
                  options={SUB_CATEGORY_OPTIONS}
                  variant="secondary"
                  showScrollButtons
                />
              </div>
            )}
          </>
        )}

        {activeTab === 'GENDER' && (
          <div className="px-4 py-2 border-b border-gray-50">
            <TabChips
              value={themeValue}
              onChange={(v) => setThemeValue(v as ThemeValue)}
              options={[
                { label: '남성', value: 'male' },
                { label: '여성', value: 'female' },
              ]}
              variant="secondary"
            />
          </div>
        )}

        {/* 검색창 */}
        <div className="px-4 py-3 border-b border-gray-100">
          <div className="relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="상권 이름으로 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* 리스트 헤더 */}
        <div className="grid grid-cols-11 gap-4 border-b border-gray-100 px-6 py-3 text-base font-semibold text-gray-500 bg-gray-50/80">
          <div className="col-span-4 pl-12">순위 / 상권명</div>
          <div className="col-span-3 text-right">{getMetricLabel()}</div>
          <div className="col-span-2 text-right">{getFluctuationLabel()}</div>
          <div className="col-span-2 text-right pr-2">상권 상태</div>
        </div>

        {/* 상권 리스트 */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {!selectedArea?.code ? (
            <div className="flex flex-col items-center justify-center h-48 text-gray-400">
              <Building2 size={40} className="mb-2 opacity-50" />
              <p className="text-base font-medium">먼저 분석 페이지에서 상권을 선택해주세요</p>
            </div>
          ) : isLoading ? (
            <div className="space-y-2">
              {[...Array(8)].map((_, i) => (
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
          ) : filteredItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-gray-400">
              <Search size={40} className="mb-2 opacity-50" />
              <p className="text-base font-medium">
                {searchTerm ? '검색 결과가 없습니다' : '비교 가능한 상권이 없습니다'}
              </p>
            </div>
          ) : (
            filteredItems.map((item, index) => {
              const fluctuation = item.fluctuationRate ?? 0;
              const label = changeLabelMap[item.changeType || ''] || item.changeType || '정보 없음';
              let badgeClass = 'bg-gray-100 text-gray-700';
              if (label.includes('뜨는')) badgeClass = 'bg-blue-100 text-blue-700';
              else if (label.includes('위험')) badgeClass = 'bg-red-100 text-red-700';
              else if (label.includes('변동')) badgeClass = 'bg-amber-100 text-amber-700';

              return (
                <button
                  key={item.code}
                  type="button"
                  onClick={() => handleSelectComparison(item)}
                  disabled={isSelecting}
                  className="grid grid-cols-11 gap-4 w-full items-center rounded-xl border border-transparent bg-gray-50/80 px-2 py-4 text-left transition hover:border-blue-200 hover:bg-blue-50 disabled:cursor-wait disabled:opacity-70 group"
                >
                  {/* Rank & Name */}
                  <div className="col-span-4 flex items-center gap-3 overflow-hidden">
                    <div
                      onClick={(e) => toggleFavorite(e, item.code)}
                      className="cursor-pointer shrink-0 p-1.5 rounded-full hover:bg-gray-200 transition-colors"
                    >
                      <Heart
                        className={`h-4 w-4 ${favorites.has(item.code) ? 'fill-red-500 text-red-500' : 'text-gray-400 group-hover:text-gray-500'}`}
                      />
                    </div>
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gray-900 text-sm font-bold text-white">
                      {index + 1}
                    </span>
                    <span className="truncate text-lg font-semibold text-gray-900 group-hover:text-blue-600">
                      {item.name}
                    </span>
                  </div>

                  {/* Value */}
                  <div className="col-span-3 text-right">
                    <span className="text-lg font-bold text-gray-900">
                      {formatAmount(item.amount)}
                    </span>
                  </div>

                  {/* Fluctuation */}
                  <div className="col-span-2 flex justify-end">
                    <div
                      className={`flex items-center text-sm font-bold ${
                        fluctuation > 0
                          ? 'text-red-500'
                          : fluctuation < 0
                            ? 'text-blue-500'
                            : 'text-gray-500'
                      }`}
                    >
                      {fluctuation > 0 ? '▲' : fluctuation < 0 ? '▼' : '-'}
                      <span className="ml-1">{Math.abs(fluctuation).toFixed(1)}%</span>
                    </div>
                  </div>

                  {/* Badge */}
                  <div className="col-span-2 flex justify-end">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-bold text-nowrap ${badgeClass}`}>
                      {label}
                    </span>
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* 푸터 */}
        <div className="px-6 py-3 border-t border-gray-100 bg-gray-50/50 rounded-b-2xl">
          <p className="text-sm text-gray-400 text-center">
            총 {filteredItems.length}개의 상권 비교 가능
          </p>
        </div>
      </div>
    </div>
  );
}
