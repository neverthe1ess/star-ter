'use client';

import { useState } from 'react';

/**
 * 【IndustryAnalysisBar 컴포넌트】
 * 
 * 업종/매출 분석 탭에서 지도 위에 표시되는 하단 바
 * - 업종 선택 버튼 (카페, 음식점, 소매업, 서비스업)
 * - 선택된 업종의 통계 (개업률, 폐업률, 점포수)
 * 
 * PriceFilterBar와 동일한 Liquid Glass 디자인 시스템 사용
 */

// 업종 목록 정의
const INDUSTRIES = [
  { id: 'cafe', name: '카페', color: 'blue' },
  { id: 'restaurant', name: '음식점', color: 'orange' },
  { id: 'retail', name: '소매업', color: 'green' },
  { id: 'service', name: '서비스업', color: 'purple' },
] as const;

type IndustryId = typeof INDUSTRIES[number]['id'];

// 목(Mock) 통계 데이터
const MOCK_STATS: Record<IndustryId, { openingRate: number; closingRate: number; storeCount: number }> = {
  cafe: { openingRate: 3.2, closingRate: 1.5, storeCount: 45 },
  restaurant: { openingRate: 4.1, closingRate: 2.8, storeCount: 78 },
  retail: { openingRate: 2.5, closingRate: 1.2, storeCount: 32 },
  service: { openingRate: 3.8, closingRate: 2.1, storeCount: 56 },
};

interface IndustryAnalysisBarProps {
  selectedIndustry: IndustryId | null;
  onSelectIndustry: (industry: IndustryId) => void;
}

export function IndustryAnalysisBar({
  selectedIndustry,
  onSelectIndustry,
}: IndustryAnalysisBarProps) {
  const [isOpen, setIsOpen] = useState(false);

  // 선택된 업종의 통계
  const stats = selectedIndustry ? MOCK_STATS[selectedIndustry] : null;

  // 색상 매핑
  const getColorClasses = (id: IndustryId, isSelected: boolean) => {
    const colors: Record<string, { bg: string; text: string; selected: string }> = {
      cafe: { bg: 'bg-blue-100', text: 'text-blue-700', selected: 'bg-blue-600 text-white' },
      restaurant: { bg: 'bg-orange-100', text: 'text-orange-700', selected: 'bg-orange-500 text-white' },
      retail: { bg: 'bg-green-100', text: 'text-green-700', selected: 'bg-green-600 text-white' },
      service: { bg: 'bg-purple-100', text: 'text-purple-700', selected: 'bg-purple-600 text-white' },
    };
    return isSelected ? colors[id].selected : `${colors[id].bg} ${colors[id].text}`;
  };

  return (
    <div className="absolute bottom-10 left-0 right-0 z-20 flex justify-center px-4 pointer-events-none">
      {/* 스프링 애니메이션 스타일 */}
      <style>{`
        @keyframes spring-up {
          0% {
            opacity: 0;
            transform: translateY(20px) scale(0.95);
          }
          60% {
            opacity: 1;
            transform: translateY(-5px) scale(1.02);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        .animate-spring-up {
          animation: spring-up 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>

      {isOpen ? (
        /* 확장 상태 */
        <div className="w-full max-w-[480px] bg-white/40 backdrop-blur-2xl rounded-[40px] p-6 shadow-2xl border border-white/40 pointer-events-auto animate-spring-up ring-1 ring-black/5">
          {/* 헤더 */}
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-3xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                {/* Chart Icon */}
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
                </svg>
              </div>
              <div>
                <p className="text-gray-900 font-bold text-xl leading-tight">업종 분석</p>
                <p className="text-indigo-600 text-sm font-semibold mt-0.5">
                  {selectedIndustry 
                    ? `${INDUSTRIES.find(i => i.id === selectedIndustry)?.name} 선택됨`
                    : '업종을 선택하세요'
                  }
                </p>
              </div>
            </div>
            
            <button 
              onClick={() => setIsOpen(false)}
              className="w-10 h-10 flex items-center justify-center rounded-full bg-white/40 hover:bg-white/60 transition-colors text-gray-600 backdrop-blur-sm"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* 업종 선택 버튼 그룹 */}
          <div className="flex flex-wrap gap-2 mb-5">
            {INDUSTRIES.map((industry) => (
              <button
                key={industry.id}
                onClick={() => onSelectIndustry(industry.id)}
                className={`px-4 py-2.5 rounded-2xl font-bold text-sm transition-all duration-200 ${getColorClasses(industry.id, selectedIndustry === industry.id)} hover:scale-105 active:scale-95`}
              >
                {industry.name}
              </button>
            ))}
          </div>

          {/* 선택된 업종 통계 */}
          {stats ? (
            <div className="bg-white/30 rounded-3xl p-4 border border-white/50">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-gray-500 text-xs font-medium mb-1">개업률</p>
                  <p className="text-blue-600 text-xl font-bold">{stats.openingRate}%</p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs font-medium mb-1">폐업률</p>
                  <p className="text-rose-500 text-xl font-bold">{stats.closingRate}%</p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs font-medium mb-1">점포수</p>
                  <p className="text-gray-900 text-xl font-bold">{stats.storeCount}개</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white/30 rounded-3xl p-4 border border-white/50 text-center text-gray-500">
              업종을 선택하면 통계가 표시됩니다
            </div>
          )}
        </div>
      ) : (
        /* 접힘 상태: Pill */
        <button 
          onClick={() => setIsOpen(true)}
          className="group pointer-events-auto flex items-center gap-5 bg-white/40 backdrop-blur-2xl rounded-full pl-4 pr-8 py-4 shadow-xl border border-white/40 hover:bg-white/50 transition-all duration-300 hover:scale-[1.03] active:scale-95 ring-1 ring-black/5"
        >
          {/* 아이콘 */}
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30 group-hover:scale-105 transition-transform duration-300">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
            </svg>
          </div>
          
          {/* 텍스트 */}
          <div className="flex flex-col items-start">
            <span className="text-gray-900 font-bold text-xl leading-none mb-1">
              업종 분석
            </span>
            <span className="text-indigo-600 text-md font-medium">
              {selectedIndustry 
                ? `${INDUSTRIES.find(i => i.id === selectedIndustry)?.name} 분석 중`
                : '업종을 선택하세요'
              }
            </span>
          </div>
          
          {/* Chevron */}
          <div className="w-8 h-8 rounded-full bg-white/30 flex items-center justify-center ml-2 opacity-0 group-hover:opacity-100 transition-all duration-300 -translate-x-4 group-hover:translate-x-0">
            <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
            </svg>
          </div>
        </button>
      )}
    </div>
  );
}

// 목(Mock) 위치 데이터 (나중에 실제 API로 대체)
// 서울 강남구 역삼동 부근 예시 좌표
const MOCK_INDUSTRY_LOCATIONS: Record<IndustryId, Array<{ lat: number; lng: number; count: number }>> = {
  cafe: [
    { lat: 37.498, lng: 127.027, count: 15 },
    { lat: 37.499, lng: 127.028, count: 8 },
    { lat: 37.497, lng: 127.026, count: 12 },
    { lat: 37.500, lng: 127.029, count: 5 },
  ],
  restaurant: [
    { lat: 37.4985, lng: 127.0275, count: 20 },
    { lat: 37.4995, lng: 127.0285, count: 18 },
    { lat: 37.4975, lng: 127.0265, count: 15 },
  ],
  retail: [
    { lat: 37.4982, lng: 127.0272, count: 10 },
    { lat: 37.4992, lng: 127.0282, count: 8 },
  ],
  service: [
    { lat: 37.4988, lng: 127.0278, count: 12 },
    { lat: 37.4998, lng: 127.0288, count: 9 },
  ],
};

// Export types and constants for MapSection
export { INDUSTRIES, MOCK_STATS, MOCK_INDUSTRY_LOCATIONS };
export type { IndustryId };
