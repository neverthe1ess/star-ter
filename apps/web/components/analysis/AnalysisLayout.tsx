'use client';

import React from 'react';

interface AnalysisLayoutProps {
  mapSection: React.ReactNode;
  infoSection: React.ReactNode;
}

export default function AnalysisLayout({
  mapSection,
  infoSection,
}: AnalysisLayoutProps) {
  return (
    <div className="flex h-screen w-full bg-gray-50">
      {/* 좌측 1/3 - 지도 영역 */}
      <div className="w-1/3 h-full border-r border-gray-200 bg-white">
        {mapSection}
      </div>

      {/* 우측 2/3 - 정보 영역 */}
      <div className="w-2/3 h-full overflow-y-auto">
        {infoSection}
      </div>
    </div>
  );
}
