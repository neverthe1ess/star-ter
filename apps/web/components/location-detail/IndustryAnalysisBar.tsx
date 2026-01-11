'use client';

import { useState } from 'react';

/**
 * 【IndustryAnalysisBar 컴포넌트】
 * 
 * 업종/매출 분석 탭에서 지도 위에 표시되는 하단 바
 * - 축소 상태: 선택된 업종과 점포 수 요약
 * - 확장 상태: 통계 정보 (점포수, 과열 지역, 매출 등)
 */

// 업종 목록 정의 (export용 유지)
const INDUSTRIES = [
  { id: 'cafe', name: '카페', color: 'blue' },
  { id: 'restaurant', name: '음식점', color: 'orange' },
  { id: 'retail', name: '소매업', color: 'green' },
  { id: 'service', name: '서비스업', color: 'purple' },
] as const;

type IndustryId = typeof INDUSTRIES[number]['id'];

interface IndustryAnalysisBarProps {
  selectedIndustry: IndustryId | null;
  onSelectIndustry: (industry: IndustryId) => void;
  // 새로 추가된 props
  storeCount?: number;
  hotspotCount?: number;
  selectedCategoryName?: string;
}

export function IndustryAnalysisBar({
  selectedCategoryName = '전체',
  storeCount = 0,
  hotspotCount = 0,
}: IndustryAnalysisBarProps) {
  const [isOpen, setIsOpen] = useState(false);

  // 추천 지수 계산 (과열 지역 많으면 낮음)
  const recommendScore = Math.max(1, 5 - hotspotCount).toFixed(1);

  return (
    <div className="absolute bottom-10 left-0 right-0 z-20 flex justify-center px-4 pointer-events-none">
      {/* 스프링 애니메이션 스타일 */}
      <style>{`
        @keyframes spring-up {
          0% { opacity: 0; transform: translateY(20px) scale(0.95); }
          60% { opacity: 1; transform: translateY(-5px) scale(1.02); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
        .animate-spring-up { animation: spring-up 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
      `}</style>

      {isOpen ? (
        /* 확장 상태: 통계 정보 표시 (업종 선택 버튼 제거) */
        <div className="w-full max-w-[480px] bg-white/40 backdrop-blur-2xl rounded-[40px] p-6 shadow-2xl border border-white/40 pointer-events-auto animate-spring-up ring-1 ring-black/5">
          {/* 헤더 */}
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-3xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
                </svg>
              </div>
              <div>
                <p className="text-gray-900 font-bold text-xl leading-tight">{selectedCategoryName} 분석</p>
                <p className="text-indigo-600 text-sm font-semibold mt-0.5">
                  이 상권의 경쟁 현황
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

          {/* 통계 카드 그리드 */}
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="bg-white/50 rounded-2xl p-4 text-center">
              <p className="text-gray-500 text-xs font-medium mb-1">점포 수</p>
              <p className="text-gray-900 text-2xl font-bold">{storeCount}개</p>
            </div>
            <div className="bg-red-50/80 rounded-2xl p-4 text-center">
              <p className="text-gray-500 text-xs font-medium mb-1">과열 지역</p>
              <p className="text-red-600 text-2xl font-bold">{hotspotCount}곳</p>
            </div>
            <div className="bg-violet-50/80 rounded-2xl p-4 text-center">
              <p className="text-gray-500 text-xs font-medium mb-1">추천 지수</p>
              <p className="text-violet-600 text-2xl font-bold">⭐ {recommendScore}</p>
            </div>
          </div>

          {/* 분석 요약 메시지 */}
          <div className="bg-gradient-to-r from-indigo-50 to-violet-50 rounded-2xl p-4 border border-indigo-100/50">
            <p className="text-gray-700 text-sm leading-relaxed font-bold">
              💡 <strong>{selectedCategoryName}</strong> 업종은 
              {hotspotCount >= 2 ? (
                <span className="text-red-600"> 경쟁 과열 상태입니다. 다른 업종을 고려해보세요.</span>
              ) : hotspotCount === 1 ? (
                <span className="text-amber-600"> 일부 과열 지역이 있어요. 위치 선정에 주의하세요.</span>
              ) : (
                <span className="text-green-600"> 경쟁이 적어 진입 기회가 있습니다!</span>
              )}
            </p>
          </div>
        </div>
      ) : (
        /* 축소 상태: Pill - PriceFilterBar와 동일한 스타일 */
        <button 
          onClick={() => setIsOpen(true)}
          className="group pointer-events-auto flex items-center gap-5 bg-white/40 backdrop-blur-2xl rounded-full pl-4 pr-8 py-4 shadow-xl border border-white/40 hover:bg-white/50 transition-all duration-300 hover:scale-[1.03] active:scale-95 ring-1 ring-black/5"
        >
          {/* 아이콘 - w-12 h-12로 PriceFilterBar와 동일 */}
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30 group-hover:scale-105 transition-transform duration-300">
            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
            </svg>
          </div>
          
          {/* 정보 표시 - text-xl/text-md로 PriceFilterBar와 동일 */}
          <div className="flex flex-col items-start">
            <span className="text-gray-900 font-bold text-xl leading-none mb-1">
              경쟁 분석
            </span>
            <span className="text-indigo-600 text-md font-medium">
              {selectedCategoryName} {storeCount}개{hotspotCount > 0 ? ` · 과열 ${hotspotCount}곳` : ''}
            </span>
          </div>
          
          {/* Chevron - w-8 h-8로 PriceFilterBar와 동일 */}
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


// Export types and constants
export { INDUSTRIES };
export type { IndustryId };
