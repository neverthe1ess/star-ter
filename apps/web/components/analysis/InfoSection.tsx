'use client';

import React from 'react';
import AnalysisHeader from './AnalysisHeader';
import CategoryTabs from './CategoryTabs';
import SummaryCards from './SummaryCards';
import TimePopulationChart from './TimePopulationChart';
import PaymentStatus from './PaymentStatus';

export default function InfoSection() {
  const [activeTab, setActiveTab] = React.useState('population');

  return (
    <div className="flex flex-col bg-gray-50">
      {/* 헤더 */}
      <AnalysisHeader />

      {/* 카테고리 탭 */}
      <CategoryTabs activeTab={activeTab} onTabChange={setActiveTab} />

      {/* 컨텐츠 영역 */}
      <div className="flex-1 overflow-y-auto">
        {/* 요약 카드 */}
        <SummaryCards />

        {/* 시간대별 유동 인구 차트 */}
        <TimePopulationChart />

        {/* 결제 현황 */}
        <PaymentStatus />
      </div>
    </div>
  );
}
