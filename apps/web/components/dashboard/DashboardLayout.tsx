'use client';

import React, { useState, useMemo } from 'react';

import RankingList from './RankingList';
import DetailPanel from './DetailPanel';
import AiInputSection from './AiInputSection';
import AppHeader from '@/components/header/AppHeader';
import TabChips from '@/components/ui/TabChips';
import { RankingItem } from './mock-data';
import { ThemeType, ThemeValue, AdminLevel } from '@/hooks/useThemeRanking';
import { IndustryData } from '@/mocks/industry';

export default function DashboardLayout() {
  const [displayedItem, setDisplayedItem] = useState<RankingItem | null>(null);
  const [activeTab, setActiveTab] = useState<ThemeType>('GROWTH');
  const [selectedCategory, setSelectedCategory] = useState<string>('I2'); // 대분류
  const [themeValue, setThemeValue] = useState<ThemeValue>('CS100001'); // 소분류
  const [ageGroup, setAgeGroup] = useState<string>('total');
  const [timeSlot, setTimeSlot] = useState<string>('total');
  const [adminLevel, setAdminLevel] = useState<AdminLevel>('commercial');
  const [detailWidth, setDetailWidth] = useState(35);
  const [isResizing, setIsResizing] = useState(false);

  // Clear selection when dashboard is fresh
  React.useEffect(() => {
    setDisplayedItem(null);
  }, []);

  // 대분류 옵션 (INDUSTRY_THEMES)
  const CATEGORY_OPTIONS = IndustryData.map((c) => ({
    label: c.name,
    value: c.code,
  }));

  // 선택된 대분류의 소분류 옵션
  const SUB_CATEGORY_OPTIONS = useMemo(() => {
    const category = IndustryData.find((c) => c.code === selectedCategory);
    return (
      category?.children?.map((child) => ({
        label: child.name,
        value: child.code,
      })) || []
    );
  }, [selectedCategory]);

  // 대분류 변경 시 첫 번째 소분류로 자동 선택
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

  const INDUSTRY_THEMES: { label: string; value: ThemeValue }[] =
    IndustryData.map((c) => ({
      label: c.name,
      value: c.code as ThemeValue,
    }));

  const POPULATION_LEVEL_OPTIONS: { label: string; value: AdminLevel }[] = [
    { label: '상권', value: 'commercial' },
    { label: '행정동', value: 'dong' },
  ];

  const INDUSTRY_LEVEL_OPTIONS: { label: string; value: AdminLevel }[] = [
    { label: '상권', value: 'commercial' },
    { label: '행정동', value: 'dong' },
  ];

  const handleTabChange = (tab: ThemeType) => {
    setActiveTab(tab);
    if (tab === 'POPULATION') {
      setAdminLevel('commercial');
    } else if (tab === 'GENDER') {
      setThemeValue('female');
      setAdminLevel('commercial');
    } else if (tab === 'INDUSTRY') {
      setThemeValue(INDUSTRY_THEMES[0].value);
      setAdminLevel('commercial');
    } else {
      // MZ, GROWTH - no sub-filter needed
      setAdminLevel('commercial');
    }
  };

  return (
    <div className="flex flex-col h-screen bg-white">
      {/* 1. App Header */}
      <AppHeader />

      {/* 2.5 AI Input Section */}
      <AiInputSection />

      {/* 3. Main Content Split View */}
      <main
        className="flex flex-1 overflow-hidden"
        onMouseMove={(e) => {
          if (!isResizing) return;
          e.preventDefault();
          // 퍼센트로 변환: (전체 너비 - 마우스 X) / 전체 너비 * 100
          const containerWidth = document.body.clientWidth;
          const newWidthPercent =
            ((containerWidth - e.clientX) / containerWidth) * 100;
          // 최소 20%, 최대 60%로 제한
          if (newWidthPercent > 20 && newWidthPercent < 60) {
            setDetailWidth(newWidthPercent);
          }
        }}
        onMouseUp={() => setIsResizing(false)}
        onMouseLeave={() => setIsResizing(false)}
      >
        <section className="flex-1 flex flex-col min-w-100 border-r border-gray-200 h-full">
          {/* Main Tabs - 토스증권 스타일 */}
          <div className="flex items-center gap-6 px-4 pt-4 border-b border-gray-100">
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

            {/* Level Filter (right aligned) */}
            <div className="flex items-center gap-2 ml-auto pb-2">
              <TabChips
                value={adminLevel}
                onChange={(v) => setAdminLevel(v as AdminLevel)}
                options={
                  activeTab === 'POPULATION'
                    ? POPULATION_LEVEL_OPTIONS
                    : INDUSTRY_LEVEL_OPTIONS
                }
                variant="secondary"
              />
            </div>
          </div>

          {/* Sub Filters - 탭별 조건 */}
          {activeTab === 'POPULATION' && (
            <>
              {/* 연령 선택 */}
              <div className="px-4 py-3 border-b border-gray-50">
                <TabChips
                  value={ageGroup}
                  onChange={setAgeGroup}
                  options={AGE_OPTIONS}
                  variant="secondary"
                />
              </div>
              {/* 시간대 선택 */}
              <div className="px-4 py-2 bg-gray-50">
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
              {/* 대분류 선택 */}
              <div className="px-4 py-3 border-b border-gray-50">
                <TabChips
                  value={selectedCategory}
                  onChange={handleCategoryChange}
                  options={CATEGORY_OPTIONS}
                  variant="secondary"
                />
              </div>
              {/* 소분류 선택 */}
              {SUB_CATEGORY_OPTIONS.length > 0 && (
                <div className="px-4 py-2 bg-gray-50">
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
            <div className="px-4 py-3 border-b border-gray-50">
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

          <div className="flex-1 overflow-hidden relative">
            <RankingList
              key={`${activeTab}-${themeValue}-${ageGroup}-${timeSlot}-${adminLevel}`}
              onSelect={() => {}} // 클릭 시 DetailPanel 갱신 불필요 (analysis로 이동만)
              onHover={setDisplayedItem} // Hover 시 DetailPanel 갱신
              themeType={activeTab}
              themeValue={themeValue}
              ageGroup={ageGroup}
              timeSlot={timeSlot}
              adminLevel={adminLevel}
            />
          </div>
        </section>

        {/* Resizer Handle */}
        <div
          className="w-1 cursor-col-resize bg-transparent hover:bg-blue-400 active:bg-blue-600 transition-colors z-20 flex flex-col justify-center items-center group"
          onMouseDown={() => setIsResizing(true)}
        >
          <div className="h-8 w-1 rounded-full bg-gray-200 group-hover:bg-blue-300" />
        </div>

        {/* Right: Detail Panel */}
        <aside
          className="shrink-0 bg-white shadow-[-4px_0_12px_rgba(0,0,0,0.05)] z-10"
          style={{ width: `${detailWidth}%` }}
        >
          {displayedItem && <DetailPanel item={displayedItem} />}
        </aside>
      </main>
    </div>
  );
}
