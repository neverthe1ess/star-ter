'use client';

import React, { useState, useEffect } from 'react';
import { RankingItem, MetricType } from './mock-data';
import { useMarketAnalytics } from '@/hooks/useMarketAnalytics';
import { RevenueLevel } from '@/services/revenue.service';
import { fetchAiSummary, formatMetricsForAi } from '@/services/ai.service';

// 분리된 하위 컴포넌트들
import MarketHeader from './detail/MarketHeader';
import MetricSection from './detail/MetricSection';
import CommunityTabs from './detail/CommunityTabs';
import { useAiSummary } from '@/hooks/useAiSummary';

interface DetailPanelProps {
  item: RankingItem;
}

/**
 * 코드 길이로 RevenueLevel 결정하는 헬퍼 함수
 * TODO: 추후 일관적인 로직으로 수정해야 함
 * - 5자리 = 자치구 (signgu_cd)
 * - 8자리 = 행정동 (adstrd_cd)
 * - 기타 = 상권 (trdar_cd)
 */
const getLevelFromAreaCode = (code: string): RevenueLevel => {
  if (code.length === 5) return 'gu';
  if (code.length === 8) return 'dong';
  return 'commercial';
};

/**
 * 1. MarketHeader - 상권명, 매출, AI 요약
 * 2. MetricSection - 지표 선택 및 차트
 * 3. CommunityTabs - 뉴스/SNS/블로그
 */
export default function DetailPanel({ item }: DetailPanelProps) {
  // 차트 지표 선택 상태
  const [chartMetric, setChartMetric] = useState<MetricType>('잘나가는 업종');

  const level = getLevelFromAreaCode(item.code);
  const { data, isLoading, error } = useMarketAnalytics(level, item.code);
  const {aiSummary, isAiLoading} = useAiSummary(item, data, isLoading);

  return (
    <div className="flex flex-col h-full bg-white border-l border-gray-200 p-6 overflow-y-auto">
      {/* 1. 상권 정보 헤더 + AI 요약 */}
      <MarketHeader item={item} aiSummary={aiSummary} isAiLoading={isAiLoading} />

      {/* 2. 상권 주요 지표 (Market Vital) */}
      <MetricSection
        data={data}
        isLoading={isLoading}
        error={error}
        chartMetric={chartMetric}
        setChartMetric={setChartMetric}
      />

      {/* 3. 커뮤니티 (뉴스/SNS/블로그) */}
      <CommunityTabs />
    </div>
  );
}

