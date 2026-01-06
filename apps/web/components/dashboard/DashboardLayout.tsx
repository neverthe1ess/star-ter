'use client';

import React, { useState } from 'react';

import RankingList from './RankingList';
import DetailPanel from './DetailPanel';
import AiInputSection from './AiInputSection';
import AppHeader from '@/components/header/AppHeader';
import FilterSelect from '@/components/ui/FilterSelect';
import { RankingItem } from './mock-data';
import { ThemeType, ThemeValue, AdminLevel } from '@/hooks/useThemeRanking';
import { IndustryData } from '@/mocks/industry';

export default function DashboardLayout() {
  const [selectedItem, setSelectedItem] = useState<RankingItem | null>(null);
  const [activeTab, setActiveTab] = useState<ThemeType>('INDUSTRY');
  const [themeValue, setThemeValue] = useState<ThemeValue>('CS100001');
  const [ageGroup, setAgeGroup] = useState<string>('total');
  const [timeSlot, setTimeSlot] = useState<string>('total');
  const [adminLevel, setAdminLevel] = useState<AdminLevel>('commercial');
  const [detailWidth, setDetailWidth] = useState(35);
  const [isResizing, setIsResizing] = useState(false);

  React.useEffect(() => {
    setSelectedItem(null);
  }, []);

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
    { label: '전체 시간', value: 'total' },
    { label: '00시 ~ 06시', value: '00' },
    { label: '06시 ~ 11시', value: '06' },
    { label: '11시 ~ 14시', value: '11' },
    { label: '14시 ~ 17시', value: '14' },
    { label: '17시 ~ 21시', value: '17' },
    { label: '21시 ~ 24시', value: '21' },
  ];

  const INDUSTRY_THEMES: { label: string; value: ThemeValue }[] =
    IndustryData.map((c) => ({
      label: c.name,
      value: c.code as ThemeValue,
    }));

  const POPULATION_LEVEL_OPTIONS: { label: string; value: AdminLevel }[] = [
    { label: '행정동', value: 'dong' },
    { label: '자치구', value: 'gu' },
  ];

  const INDUSTRY_LEVEL_OPTIONS: { label: string; value: AdminLevel }[] = [
    { label: '상권', value: 'commercial' },
    { label: '행정동', value: 'dong' },
    { label: '자치구', value: 'gu' },
  ];

  const handleTabChange = (tab: ThemeType) => {
    setActiveTab(tab);
    if (tab === 'POPULATION') {
      setThemeValue('MZ');
      if (adminLevel === 'commercial') {
        setAdminLevel('dong');
      }
    } else {
      setThemeValue(INDUSTRY_THEMES[0].value);
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
          const newWidthPercent = ((containerWidth - e.clientX) / containerWidth) * 100;
          // 최소 20%, 최대 60%로 제한
          if (newWidthPercent > 20 && newWidthPercent < 60) {
            setDetailWidth(newWidthPercent);
          }
        }}
        onMouseUp={() => setIsResizing(false)}
        onMouseLeave={() => setIsResizing(false)}
      >
        <section className="flex-1 flex flex-col min-w-[400px] border-r border-gray-200 h-full">
          {/* Tabs */}
          <div className="flex gap-2 p-4 pb-0 shrink-0">
            <button
              onClick={() => handleTabChange('INDUSTRY')}
              className={`flex-1 rounded-xl py-3 text-sm font-bold transition-all ${
                activeTab === 'INDUSTRY'
                  ? 'bg-gray-900 text-white shadow-md'
                  : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
              }`}
            >
              업종별
            </button>
            <button
              onClick={() => handleTabChange('POPULATION')}
              className={`flex-1 rounded-xl py-3 text-sm font-bold transition-all ${
                activeTab === 'POPULATION'
                  ? 'bg-gray-900 text-white shadow-md'
                  : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
              }`}
            >
              유동인구
            </button>
          </div>

          {/* Sub-selector */}
          <div className="flex gap-2 px-4 py-3 items-center shrink-0">
            {activeTab === 'POPULATION' ? (
              <>
                <FilterSelect
                  value={ageGroup}
                  onChange={setAgeGroup}
                  options={AGE_OPTIONS}
                />
                <FilterSelect
                  value={timeSlot}
                  onChange={setTimeSlot}
                  options={TIME_OPTIONS}
                />
              </>
            ) : (
              <FilterSelect
                value={themeValue}
                onChange={(v) => setThemeValue(v as ThemeValue)}
                options={INDUSTRY_THEMES}
              />
            )}

            {/* Level Selector */}
            <FilterSelect
              value={adminLevel}
              onChange={(v) => setAdminLevel(v as AdminLevel)}
              options={
                activeTab === 'POPULATION'
                  ? POPULATION_LEVEL_OPTIONS
                  : INDUSTRY_LEVEL_OPTIONS
              }
              className="ml-auto"
            />
          </div>

          <div className="flex-1 overflow-hidden relative">
            <RankingList
              key={`${activeTab}-${themeValue}-${ageGroup}-${timeSlot}-${adminLevel}`}
              onSelect={setSelectedItem}
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
          {selectedItem && <DetailPanel item={selectedItem} />}
        </aside>
      </main>
    </div>
  );
}
