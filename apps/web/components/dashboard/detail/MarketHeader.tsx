'use client';

import React from 'react';
import { Sparkles } from 'lucide-react';
import { RankingItem } from '../mock-data';
import { formatKoreanCurrency } from '@/utils/currency-convert-format';

interface MarketHeaderProps {
  item: RankingItem;
  aiSummary: string;
  isAiLoading: boolean;
}

// 변동률 기반 상태 배지 결정
const getStatusBadge = (fluctuation: number) => {
  if (fluctuation >= 10) return { label: '뜨는 상권', className: 'bg-blue-100 text-blue-700' };
  if (fluctuation >= 3) return { label: '변동 상권', className: 'bg-amber-100 text-amber-700' };
  if (fluctuation <= -3) return { label: '위험 상권', className: 'bg-red-100 text-red-700' };
  return { label: '정체 상권', className: 'bg-gray-100 text-gray-700' };
};

/**
 * MarketHeader 컴포넌트
 * 
 * 상권 상세 패널의 헤더 영역을 담당합니다.
 * - 상권명, 코드, 카테고리 표시
 * - 매출/유동인구 정보 및 상태 배지
 * - AI 요약 박스
 */
export default function MarketHeader({ item, aiSummary, isAiLoading }: MarketHeaderProps) {
  const status = getStatusBadge(item.fluctuation);

  return (
    <div className="mb-8">
      {/* 상권명 및 코드 */}
      <div className="flex items-center gap-3 mb-2">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{item.name}</h2>
          <span className="text-base text-gray-500">
            {item.code.toUpperCase()} · {item.category}
          </span>
        </div>
      </div>

      {/* 매출/유동인구 및 상태 배지 */}
      <div className="flex items-center gap-3 mt-4">
        <span className="text-3xl font-bold text-gray-900">
          {formatKoreanCurrency(item.revenue, { showWon: true })}
        </span>
        <span className={`px-3 py-1 rounded-full text-sm font-bold ${status.className}`}>
          {status.label}
        </span>
      </div>
      <p className="text-md text-gray-600 mt-1">
        {item.metricType === 'POPULATION' ? '분기 평균 유동인구' : '평균 매출(월)'}
      </p>

      {/* AI 요약 박스 */}
      <div className="mt-6 bg-blue-50 p-4 rounded-xl border border-blue-100 min-h-[120px]">
        <div className="flex gap-3">
          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
            {isAiLoading ? (
              <Sparkles className="w-4 h-4 text-blue-600 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4 text-blue-600" />
            )}
          </div>
          <div className="flex-1">
            <p className="text-md font-bold text-gray-900 mb-1">AI 상권 요약</p>
            {isAiLoading ? (
              <div className="space-y-2 animate-pulse mt-2">
                <div className="h-3 bg-blue-200/50 rounded w-3/4"></div>
                <div className="h-3 bg-blue-200/50 rounded w-full"></div>
                <div className="h-3 bg-blue-200/50 rounded w-5/6"></div>
              </div>
            ) : (
              <p className="text-md text-black-600 leading-relaxed whitespace-pre-line">
                {aiSummary || item.summary || '데이터를 분석하고 있어요...'}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
