'use client';

import React, { useEffect } from 'react';
import AnalysisMap from './AnalysisMap';
import ModeToggle from './ModeToggle';
import { useMapStore } from '../../stores/useMapStore';
import { useRealEstateData } from '../../hooks/useRealEstateData';

export default function MapSection() {
  const {
    viewMode,
    setViewMode,
    setSelectedRealEstateItem,
    setRealEstateList,
    hoveredRealEstateItemId,
  } = useMapStore();
  const { data: realEstateData, fetchByBBox, clearData } = useRealEstateData();

  // viewMode 변경 시 데이터 정리
  useEffect(() => {
    if (viewMode === 'analysis' || viewMode === 'population') {
      clearData();
      setSelectedRealEstateItem(null);
    }
  }, [viewMode, clearData, setSelectedRealEstateItem]);

  // 디버깅 & 스토어 동기화
  useEffect(() => {
    setRealEstateList(realEstateData);
    if (realEstateData.length > 0) {
      console.log('Real estate data loaded:', realEstateData.length);
    }
  }, [realEstateData, setRealEstateList]);

  return (
    <div className="relative h-full flex flex-col p-6 bg-white">
      <div className="relative flex-1 rounded-2xl overflow-hidden border border-gray-100 shadow-inner">
        <div className="absolute inset-0 z-0">
          <AnalysisMap
            onBoundsChange={
              viewMode === 'real-estate' ? fetchByBBox : undefined
            }
            realEstateData={viewMode === 'real-estate' ? realEstateData : []}
            onMarkerClick={setSelectedRealEstateItem}
            hoveredItemId={hoveredRealEstateItemId}
            showPopulationHeatmap={viewMode === 'population'}
          />
        </div>
        {/* 모드 토글 버튼 */}
        <ModeToggle mode={viewMode} onModeChange={setViewMode} />
      </div>
    </div>
  );
}
