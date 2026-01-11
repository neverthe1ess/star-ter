'use client';

import { formatToKoreaCurrency } from './utils';
import { useState } from 'react';

/**
 * 【PriceFilterBar 컴포넌트】
 * 
 * Apple Live Activities 스타일 + 흰색 Liquid Glass 효과
 * 양쪽 핸들로 최소/최대 가격 조절 가능
 */

interface PriceFilterBarProps {
  minDeposit: number;
  maxDeposit: number;
  minRent: number;
  maxRent: number;
  depositRange: [number, number];
  rentRange: [number, number];
  onDepositChange: (range: [number, number]) => void;
  onRentChange: (range: [number, number]) => void;
  totalCount: number;
  filteredCount: number;
}

export function PriceFilterBar({
  minDeposit,
  maxDeposit,
  minRent,
  maxRent,
  depositRange,
  rentRange,
  onDepositChange,
  onRentChange,
  totalCount,
  filteredCount,
}: PriceFilterBarProps) {
  const [isOpen, setIsOpen] = useState(false);

  // 슬라이더 값을 퍼센트로 변환 (0 나눗셈 방지)
  const depositDiff = maxDeposit - minDeposit || 1;
  const rentDiff = maxRent - minRent || 1;
  
  const depositLeftPercent = ((depositRange[0] - minDeposit) / depositDiff) * 100;
  const depositRightPercent = ((depositRange[1] - minDeposit) / depositDiff) * 100;
  const rentLeftPercent = ((rentRange[0] - minRent) / rentDiff) * 100;
  const rentRightPercent = ((rentRange[1] - minRent) / rentDiff) * 100;

  return (
    <div className="absolute bottom-10 left-0 right-0 z-20 flex justify-center px-4 pointer-events-none">
      <style>{`
        .dual-range-slider::-webkit-slider-thumb {
          pointer-events: auto;
          width: 22px;
          height: 22px;
          -webkit-appearance: none;
          cursor: pointer;
        }
        .dual-range-slider::-moz-range-thumb {
          pointer-events: auto;
          width: 22px;
          height: 22px;
          cursor: pointer;
          border: none;
        }
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

      {/* 
         isOpen 상태에 따라 다른 UI 표시 
         - pointer-events-auto를 자식에 적용하여 배경 클릭은 통과시키고 컴포넌트만 클릭 가능하게 함
      */}
      {isOpen ? (
        <div className="w-full max-w-[420px] bg-white/40 backdrop-blur-2xl rounded-[40px] p-6 shadow-2xl border border-white/40 pointer-events-auto animate-spring-up ring-1 ring-black/5">
          {/* 상단: 헤더 및 닫기 버튼 */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-3xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                {/* Building Icon (Larger) */}
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <div>
                <p className="text-gray-900 font-bold text-xl leading-tight">가격 필터</p>
                <p className="text-blue-600 text-md font-semibold mt-0.5">
                  {filteredCount.toLocaleString()}개 / {totalCount.toLocaleString()}개 매물
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

          {/* 슬라이더 영역 */}
          <div className="space-y-6">
            {/* 보증금 슬라이더 */}
            <div className="bg-white/30 rounded-3xl p-4 border border-white/50 shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <span className="text-gray-600 text-lg font-bold tracking-wide">보증금</span>
                <span className="text-blue-700 text-base font-bold bg-blue-100/50 px-3 py-1.5 rounded-xl">
                  {formatToKoreaCurrency(depositRange[0])} ~ {formatToKoreaCurrency(depositRange[1])}
                </span>
              </div>
              <div className="relative h-3 bg-gray-200/60 rounded-full mx-2">
                <div 
                  className="absolute h-full bg-gradient-to-r from-blue-200 to-blue-600 rounded-full opacity-90"
                  style={{
                    left: `${depositLeftPercent}%`,
                    width: `${depositRightPercent - depositLeftPercent}%`
                  }}
                />
                <input
                  type="range"
                  min={minDeposit}
                  max={maxDeposit}
                  value={depositRange[0]}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    if (val < depositRange[1]) {
                      onDepositChange([val, depositRange[1]]);
                    }
                  }}
                  className="absolute w-full h-full opacity-0 cursor-pointer z-20 pointer-events-none dual-range-slider"
                />
                <input
                  type="range"
                  min={minDeposit}
                  max={maxDeposit}
                  value={depositRange[1]}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    if (val > depositRange[0]) {
                      onDepositChange([depositRange[0], val]);
                    }
                  }}
                  className="absolute w-full h-full opacity-0 cursor-pointer z-20 pointer-events-none dual-range-slider"
                />
                <div 
                  className="absolute top-1/2 -translate-y-1/2 w-6 h-6 bg-white rounded-full shadow-lg border-[3px] border-blue-500 transition-transform hover:scale-110 z-10"
                  style={{ left: `calc(${depositLeftPercent}% - 12px)` }}
                />
                <div 
                  className="absolute top-1/2 -translate-y-1/2 w-6 h-6 bg-white rounded-full shadow-lg border-[3px] border-blue-500 transition-transform hover:scale-110 z-10"
                  style={{ left: `calc(${depositRightPercent}% - 12px)` }}
                />
              </div>
            </div>

            {/* 월세 슬라이더 */}
            <div className="bg-white/30 rounded-3xl p-4 border border-white/50 shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <span className="text-gray-600 text-lg font-bold tracking-wide">월세</span>
                <span className="text-orange-600 text-base font-bold bg-rose-100 px-3 py-1.5 rounded-xl">
                  {formatToKoreaCurrency(rentRange[0])} ~ {formatToKoreaCurrency(rentRange[1])}
                </span>
              </div>
              <div className="relative h-3 bg-gray-200/60 rounded-full mx-2">
                <div 
                  className="absolute h-full bg-gradient-to-r from-orange-200 to-orange-500 rounded-full opacity-90"
                  style={{
                    left: `${rentLeftPercent}%`,
                    width: `${rentRightPercent - rentLeftPercent}%`
                  }}
                />
                <input
                  type="range"
                  min={minRent}
                  max={maxRent}
                  value={rentRange[0]}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    if (val < rentRange[1]) {
                      onRentChange([val, rentRange[1]]);
                    }
                  }}
                  className="absolute w-full h-full opacity-0 cursor-pointer z-20 pointer-events-none dual-range-slider"
                />
                <input
                  type="range"
                  min={minRent}
                  max={maxRent}
                  value={rentRange[1]}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    if (val > rentRange[0]) {
                      onRentChange([rentRange[0], val]);
                    }
                  }}
                  className="absolute w-full h-full opacity-0 cursor-pointer z-20 pointer-events-none dual-range-slider"
                />
                <div 
                  className="absolute top-1/2 -translate-y-1/2 w-6 h-6 bg-white rounded-full shadow-lg border-[3px] border-rose-500 transition-transform hover:scale-110 z-10"
                  style={{ left: `calc(${rentLeftPercent}% - 12px)` }}
                />
                <div 
                  className="absolute top-1/2 -translate-y-1/2 w-6 h-6 bg-white rounded-full shadow-lg border-[3px] border-rose-500 transition-transform hover:scale-110 z-10"
                  style={{ left: `calc(${rentRightPercent}% - 12px)` }}
                />
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* 닫힘 상태: 알약(Pill) 모양 - 크기 확대 */
        <button 
          onClick={() => setIsOpen(true)}
          className="group pointer-events-auto flex items-center gap-5 bg-white/40 backdrop-blur-2xl rounded-full pl-4 pr-8 py-4 shadow-xl border border-white/40 hover:bg-white/50 transition-all duration-300 hover:scale-[1.03] active:scale-95 ring-1 ring-black/5"
        >
          {/* 아이콘 */}
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/30 group-hover:scale-105 transition-transform duration-300">
            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          
          {/* 텍스트 정보 */}
          <div className="flex flex-col items-start">
            <span className="text-gray-900 font-bold text-xl leading-none mb-1">
              {filteredCount.toLocaleString()}개 매물
            </span>
            <span className="text-blue-700 text-md font-medium">
              인근 지역 검색결과
            </span>
          </div>
          
          {/* 열기 힌트 (Chevron) - 좀 더 크게 */}
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
