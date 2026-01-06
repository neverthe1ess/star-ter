'use client';

import React from 'react';
import AppHeader from '@/components/header/AppHeader';

interface AnalysisLayoutProps {
  mapSection: React.ReactNode;
  infoSection: React.ReactNode;
}

export default function AnalysisLayout({
  mapSection,
  infoSection,
}: AnalysisLayoutProps) {
  return (
    <div className="flex flex-col h-screen w-full bg-white">
      {/* 헤더 */}
      <AppHeader />

      {/* 메인 컨텐츠 */}
      <div className="flex flex-1 overflow-hidden">
        {/* 좌측 1/3 - 지도 영역 */}
        <div className="w-1/3 h-full">
          {mapSection}
        </div>

        {/* 우측 2/3 - 정보 영역 */}
        <div className="w-2/3 h-full overflow-auto">
          {infoSection}
        </div>
      </div>
    </div>
  );
}
