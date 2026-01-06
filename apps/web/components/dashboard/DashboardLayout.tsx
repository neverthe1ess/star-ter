'use client';

import React, { useState } from 'react';
import { Search, Home, PieChart, MessageSquare, Building2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

import RankingList from './RankingList';
import DetailPanel from './DetailPanel';
import AiInputSection from './AiInputSection';
import FilterSelect from '@/components/ui/FilterSelect';
import { RankingItem } from './mock-data';
import { useAuth } from '@/hooks/useAuth';
import { useModalStore } from '@/stores/useModalStore';
import { ThemeType, ThemeValue, AdminLevel } from '@/hooks/useThemeRanking';
import { IndustryData } from '@/mocks/industry';

export default function DashboardLayout() {
  const router = useRouter();
  const { isLoggedIn } = useAuth();
  const { openModal } = useModalStore();
  const [selectedItem, setSelectedItem] = useState<RankingItem | null>(null);
  const [activeTab, setActiveTab] = useState<ThemeType>('INDUSTRY');
  const [themeValue, setThemeValue] = useState<ThemeValue>('CS100001');
  const [ageGroup, setAgeGroup] = useState<string>('total');
  const [timeSlot, setTimeSlot] = useState<string>('total');
  const [adminLevel, setAdminLevel] = useState<AdminLevel>('commercial');
  const [detailWidth, setDetailWidth] = useState(35); // 퍼센트 (기본값: 35%)
  const [isResizing, setIsResizing] = useState(false);

  // Clear selection when dashboard is fresh (e.g., back from analysis)
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

  // 부동산 등록 클릭 핸들러 (로그인 체크 + 모달)
  const handleRealEstateClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isLoggedIn) {
      router.push('/real-estate/register');
    } else {
      openModal({
        type: 'confirm',
        title: '로그인 필요',
        content: '부동산 등록을 위해서는 로그인이 필요합니다.',
        confirmText: '로그인',
        cancelText: '취소',
        onConfirm: () => {
          router.push('/login');
        },
      });
    }
  };

  return (
    <div className="flex flex-col h-screen bg-white">
      {/* 1. Global Header */}
      <header className="flex h-16 items-center justify-between border-b border-gray-200 px-6">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded bg-blue-600 flex items-center justify-center">
              <span className="text-white font-bold">M</span>
            </div>
            <span className="text-xl font-bold tracking-tight text-gray-900">
              Star-ter with AI
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-500">
            <a href="#" className="flex items-center gap-1 hover:text-gray-900">
              <Home className="h-4 w-4" /> 홈
            </a>
            <a href="#" className="flex items-center gap-1 text-gray-900">
              <PieChart className="h-4 w-4" /> 상권분석
            </a>
            <a href="#" className="flex items-center gap-1 hover:text-gray-900">
              <MessageSquare className="h-4 w-4" /> 커뮤니티
            </a>
            <button
              onClick={handleRealEstateClick}
              className="flex items-center gap-1 hover:text-gray-900"
            >
              <Building2 className="h-4 w-4" /> 부동산 등록
            </button>
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="지역, 상권, 아파트 검색"
              className="w-full rounded-full bg-gray-100 py-2 pl-10 pr-4 text-sm outline-none focus:ring-2 focus:ring-blue-100"
            />
          </div>
          {isLoggedIn ? (
            <button
              onClick={() => router.push('/user')}
              className="flex h-9 w-24 items-center justify-center rounded bg-gray-600 text-sm font-bold text-white hover:bg-gray-700"
            >
              마이페이지
            </button>
          ) : (
            <button
              onClick={() => router.push('/login')}
              className="flex h-9 w-24 items-center justify-center rounded bg-blue-600 text-sm font-bold text-white hover:bg-blue-700"
            >
              로그인
            </button>
          )}
        </div>
      </header>

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
