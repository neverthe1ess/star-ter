'use client';

import React, { useEffect, useRef } from 'react';
import { Maximize2, ZoomIn, ZoomOut } from 'lucide-react';
import AnalysisMap from './AnalysisMap';
import { useMapStore } from '../../stores/useMapStore';
import { SelectedArea } from '../../types/map-store-types';

// 데모용 기본 데이터 (랜딩페이지 연동 전까지 사용)
const DEMO_AREA: SelectedArea = {
  name: '역삼1동',
  coords: { lat: 37.4995, lng: 127.0365 },
  type: 'dong',
};

export default function MapSection() {
  const { selectArea, setZoom, zoom, selectedArea } = useMapStore();
  const hasInitialized = useRef(false);

  // 페이지 진입 시 초기화
  useEffect(() => {
    if (hasInitialized.current) return;
    hasInitialized.current = true;

    // 랜딩페이지에서 이미 선택된 지역이 없으면 데모 데이터 사용
    if (!selectedArea) {
      selectArea(DEMO_AREA);
    }
  }, [selectedArea, selectArea]);

  const handleZoomIn = () => setZoom(Math.max((zoom || 5) - 1, 1));
  const handleZoomOut = () => setZoom(Math.min((zoom || 5) + 1, 14));
  const handleReset = () => setZoom(5);

  return (
    <div className="relative h-full flex flex-col p-6 bg-white">
      <div className="relative flex-1 rounded-2xl overflow-hidden border-4 border-gray-100 shadow-inner">
        <div className="absolute inset-0 z-0">
          <AnalysisMap />
        </div>

        {/* 줌 컨트롤 */}
        <div className="absolute top-4 right-4 z-10 flex flex-col gap-1">
          <button 
            onClick={handleReset}
            className="p-2 bg-white/90 backdrop-blur-sm border border-gray-200 rounded-lg shadow-sm hover:bg-white transition-colors"
          >
            <Maximize2 size={16} className="text-gray-600" />
          </button>
          <button 
            onClick={handleZoomIn}
            className="p-2 bg-white/90 backdrop-blur-sm border border-gray-200 rounded-lg shadow-sm hover:bg-white transition-colors"
          >
            <ZoomIn size={16} className="text-gray-600" />
          </button>
          <button 
            onClick={handleZoomOut}
            className="p-2 bg-white/90 backdrop-blur-sm border border-gray-200 rounded-lg shadow-sm hover:bg-white transition-colors"
          >
            <ZoomOut size={16} className="text-gray-600" />
          </button>
        </div>
      </div>
    </div>
  );
}
