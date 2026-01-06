'use client';

import React from 'react';
import AnalysisMap from '@/components/analysis/AnalysisMap';

interface MapAction {
  type: 'showMarker' | 'highlightPolygon' | 'compare' | null;
  data?: {
    code?: string;
    codes?: string[];
    coordinates?: [number, number];
  };
}

interface AssistantMapSectionProps {
  mapAction: MapAction;
}

// AI 어시스턴트용 지도 섹션
// - 기존 AnalysisMap 재사용
// - LLM 응답에 따른 마커/폴리곤/비교 인터랙션 지원
export default function AssistantMapSection({ mapAction }: AssistantMapSectionProps) {
  // TODO: mapAction에 따른 지도 인터랙션 구현
  // - showMarker: 특정 좌표에 마커 표시
  // - highlightPolygon: 상권 코드로 폴리곤 하이라이트
  // - compare: 여러 상권 동시 표시

  return (
    <div className="relative h-full flex flex-col p-4 bg-white">
      {/* 지도 영역 */}
      <div className="relative flex-1 rounded-2xl overflow-hidden border border-gray-100 shadow-inner">
        <div className="absolute inset-0 z-0">
          <AnalysisMap />
        </div>

        {/* 지도 액션 표시 (디버그용) */}
        {mapAction.type && (
          <div className="absolute top-4 left-4 z-10 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-2 shadow-lg text-sm">
            <span className="font-medium text-blue-600">
              {mapAction.type === 'showMarker' && '📍 마커 표시'}
              {mapAction.type === 'highlightPolygon' && '🔷 폴리곤 하이라이트'}
              {mapAction.type === 'compare' && '⚖️ 상권 비교'}
            </span>
            {mapAction.data?.code && (
              <span className="text-gray-500 ml-2">코드: {mapAction.data.code}</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
